<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the user dashboard based on their role.
     */
    public function index()
    {
        // Redirect to the appropriate dashboard based on role
        $user = Auth::user();
        
        if ($user->hasRole('admin')) {
            return $this->adminDashboard();
        } elseif ($user->hasRole('teacher')) {
            return $this->teacherDashboard();
        } else {
            return $this->studentDashboard();
        }
    }
    
    /**
     * Display the admin dashboard.
     */
    protected function adminDashboard()
    {
        try {
            // User statistics
            $totalUsers = User::count();
            $studentCount = User::role('student')->count();
            $teacherCount = User::role('teacher')->count();
            $adminCount = User::role('admin')->count();
            
            // Get users joined this month
            $startOfMonth = Carbon::now()->startOfMonth();
            $usersThisMonth = User::where('created_at', '>=', $startOfMonth)->count();
            
            // Calculate growth rate (compared to previous month)
            $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
            $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();
            $usersLastMonth = User::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
            $growthRate = $usersLastMonth > 0 
                ? round((($usersThisMonth - $usersLastMonth) / $usersLastMonth) * 100, 1) 
                : 0;
            
            // Course statistics
            $totalCourses = Course::count();
            $activeCourses = Course::where('status', 'active')->count();
            $completedCourses = Course::where('status', 'completed')->count();
            
            // Calculate average enrollment per course
            $totalEnrollments = DB::table('enrollments')->count();
            $averageEnrollment = $totalCourses > 0 ? round($totalEnrollments / $totalCourses, 1) : 0;
            
            // Calculate overall course completion rate
            $completionRate = $totalCourses > 0 ? round(($completedCourses / $totalCourses) * 100) : 0;
            
            // System stats
            $totalHomework = Homework::count();
            $completedHomework = HomeworkSubmission::where('status', 'approved')->count();
            $homeworkCompletionRate = $totalHomework > 0 ? round(($completedHomework / $totalHomework) * 100) : 0;
            
            // Average teacher response time (in days)
            $averageResponseTime = 1.2; // This would come from a real calculation in a production app
            
            // Active users count (users who logged in within last 7 days)
            $lastWeek = Carbon::now()->subDays(7);
            $activeUsers = User::where('updated_at', '>=', $lastWeek)->count();
            
            // Combine recent activity from various sources
            $recentActivity = $this->getRecentActivity(15);
            
            return Inertia::render('AdminDashboard', [
                'userStats' => [
                    'total' => $totalUsers,
                    'students' => $studentCount,
                    'teachers' => $teacherCount,
                    'admins' => $adminCount,
                    'activeThisMonth' => $usersThisMonth,
                    'growthRate' => $growthRate,
                ],
                'courseStats' => [
                    'total' => $totalCourses,
                    'active' => $activeCourses,
                    'completed' => $completedCourses,
                    'averageEnrollment' => $averageEnrollment,
                    'completionRate' => $completionRate,
                ],
                'systemStats' => [
                    'homeworkCompletionRate' => $homeworkCompletionRate,
                    'averageTeacherResponseTime' => $averageResponseTime,
                    'systemHealth' => 98, // Just a placeholder for demo
                    'activeUsers' => $activeUsers,
                ],
                'recentActivity' => $recentActivity,
            ]);
        } catch (\Exception $e) {
            Log::error("Admin Dashboard Error: " . $e->getMessage());
            
            // Return a simplified dashboard with error state
            return Inertia::render('AdminDashboard', [
                'userStats' => [
                    'total' => 0,
                    'students' => 0,
                    'teachers' => 0,
                    'admins' => 0,
                    'activeThisMonth' => 0,
                    'growthRate' => 0,
                ],
                'courseStats' => [
                    'total' => 0,
                    'active' => 0,
                    'completed' => 0,
                    'averageEnrollment' => 0,
                    'completionRate' => 0,
                ],
                'systemStats' => [
                    'homeworkCompletionRate' => 0,
                    'averageTeacherResponseTime' => 0,
                    'systemHealth' => 0,
                    'activeUsers' => 0,
                ],
                'recentActivity' => [],
                'error' => 'An error occurred while loading the dashboard.'
            ]);
        }
    }
    
    /**
     * Display the teacher dashboard.
     */
    protected function teacherDashboard()
    {
        try {
            $user = Auth::user();
            
            // Get courses taught by this teacher
            $teacherCourses = $user->teacherCourses()
                ->with('users')
                ->get()
                ->map(function ($course) {
                    // Calculate completion rate for this course
                    $totalAssignments = $course->homeworks()->count();
                    $completedAssignments = HomeworkSubmission::whereIn('homework_id', 
                        $course->homeworks()->pluck('homeworks.id')
                    )->where('status', 'approved')->count();
                    
                    $completionRate = $totalAssignments > 0 ? round(($completedAssignments / $totalAssignments) * 100) : 0;
                    
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                        'status' => $course->status,
                        'student_count' => $course->users()->count(),
                        'completion_rate' => $completionRate,
                        'start_date' => $course->start_date,
                        'end_date' => $course->end_date,
                    ];
                });
            
            // Get pending reviews (homework submissions that need review)
            $pendingReviews = HomeworkSubmission::whereIn('homework_id', 
                    Homework::whereIn('course_id', $user->teacherCourses()->pluck('courses.id'))->pluck('homeworks.id')
                )
                ->where('status', 'pending')
                ->with(['homework.course', 'user'])
                ->get()
                ->map(function ($submission) {
                    return [
                        'id' => $submission->id,
                        'title' => $submission->homework->title,
                        'student' => [
                            'id' => $submission->user->id,
                            'name' => $submission->user->name,
                        ],
                        'course' => [
                            'id' => $submission->homework->course->id,
                            'title' => $submission->homework->course->title,
                        ],
                        'submitted_at' => $submission->created_at,
                    ];
                });
            
            // Get stats for this teacher
            $totalStudents = DB::table('enrollments')
                ->whereIn('course_id', $user->teacherCourses()->pluck('courses.id'))
                ->distinct('user_id')
                ->count('user_id');
                
            $totalCourses = $user->teacherCourses()->count();
            
            // Calculate completion rate across all courses
            $teacherHomeworks = Homework::whereIn('course_id', $user->teacherCourses()->pluck('courses.id'))->count();
            $teacherHomeworkCompleted = HomeworkSubmission::whereIn('homework_id', 
                Homework::whereIn('course_id', $user->teacherCourses()->pluck('courses.id'))->pluck('homeworks.id')
            )->where('status', 'approved')->count();
            
            $completionRate = $teacherHomeworks > 0 
                ? round(($teacherHomeworkCompleted / $teacherHomeworks) * 100) 
                : 0;
                
            // Get recent activity for this teacher's courses
            $recentActivity = $this->getTeacherActivity($user->id, 10);
            
            return Inertia::render('TeacherDashboard', [
                'teacherCourses' => $teacherCourses,
                'pendingReviews' => $pendingReviews,
                'stats' => [
                    'totalStudents' => $totalStudents,
                    'totalCourses' => $totalCourses,
                    'completionRate' => $completionRate,
                    'pendingReviews' => $pendingReviews->count(),
                ],
                'recentActivity' => $recentActivity,
            ]);
        } catch (\Exception $e) {
            Log::error("Teacher Dashboard Error: " . $e->getMessage());
            
            // Return a simplified dashboard with error state
            return Inertia::render('TeacherDashboard', [
                'teacherCourses' => [],
                'pendingReviews' => [],
                'stats' => [
                    'totalStudents' => 0,
                    'totalCourses' => 0,
                    'completionRate' => 0,
                    'pendingReviews' => 0,
                ],
                'recentActivity' => [],
                'error' => 'An error occurred while loading the dashboard.'
            ]);
        }
    }
    
    /**
     * Display the student dashboard.
     */
    protected function studentDashboard()
    {
        try {
            $user = Auth::user();
            
            // Get enrolled courses
            $enrolledCourses = $user->enrolledCourses()
                ->with('teacher')
                ->get()
                ->map(function ($course) use ($user) {
                    // Calculate completion percentage for this student in this course
                    $totalAssignments = $course->homeworks()->count();
                    $completedAssignments = HomeworkSubmission::where('user_id', $user->id)
                        ->whereIn('homework_id', $course->homeworks()->pluck('homeworks.id'))
                        ->where('status', 'approved')
                        ->count();
                    
                    $completionPercentage = $totalAssignments > 0 ? round(($completedAssignments / $totalAssignments) * 100) : 0;
                    
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                        'status' => $course->status,
                        'completion_percentage' => $completionPercentage,
                        'teacher' => [
                            'id' => $course->teacher->id,
                            'name' => $course->teacher->name,
                        ],
                        'start_date' => $course->start_date,
                        'end_date' => $course->end_date,
                    ];
                });
            
            // Get pending homework (assignments not yet submitted)
            $pendingHomework = Homework::whereIn('course_id', $user->enrolledCourses()->pluck('courses.id'))
                ->whereDoesntHave('submissions', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->with('course')
                ->get()
                ->map(function ($assignment) {
                    return [
                        'id' => $assignment->id,
                        'title' => $assignment->title,
                        'description' => $assignment->description,
                        'due_date' => $assignment->due_date,
                        'status' => 'pending',
                        'course' => [
                            'id' => $assignment->course->id,
                            'title' => $assignment->course->title,
                        ],
                    ];
                });
            
            // Statistics
            $activeCourses = $enrolledCourses->where('status', 'active')->count();
            $completedHomework = HomeworkSubmission::where('user_id', $user->id)
                ->where('status', 'approved')
                ->count();
            
            // Get recent activity for this student
            $recentActivity = $this->getStudentActivity($user->id, 10);
            
            return Inertia::render('StudentDashboard', [
                'enrolledCourses' => $enrolledCourses,
                'pendingHomework' => $pendingHomework,
                'recentActivity' => $recentActivity,
                'stats' => [
                    'enrolledCourses' => $enrolledCourses->count(),
                    'activeCourses' => $activeCourses,
                    'completedHomework' => $completedHomework,
                    'pendingHomework' => $pendingHomework->count(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("Student Dashboard Error: " . $e->getMessage());
            
            // Return a simplified dashboard with error state
            return Inertia::render('StudentDashboard', [
                'enrolledCourses' => [],
                'pendingHomework' => [],
                'recentActivity' => [],
                'stats' => [
                    'enrolledCourses' => 0,
                    'activeCourses' => 0,
                    'completedHomework' => 0,
                    'pendingHomework' => 0,
                ],
                'error' => 'An error occurred while loading the dashboard.'
            ]);
        }
    }

    protected function getRecentActivity($limit = 10)
    {
        // In a real app, this would come from an Activity model
        // For demo purposes, we'll create some sample activities
        $activities = [];
        
        // Add new user registrations
        $newUsers = User::orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => 'user_' . $user->id,
                    'type' => 'user',
                    'description' => 'New user registered: ' . $user->name,
                    'created_at' => $user->created_at,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'role' => $user->roles()->first() ? $user->roles()->first()->name : 'student',
                    ],
                ];
            });
        $activities = array_merge($activities, $newUsers->toArray());
        
        // Add new course creations
        $newCourses = Course::orderBy('created_at', 'desc')
            ->with('teacher')
            ->take(3)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => 'course_' . $course->id,
                    'type' => 'course',
                    'description' => 'New course created: ' . $course->title,
                    'created_at' => $course->created_at,
                    'user' => [
                        'id' => $course->teacher->id,
                        'name' => $course->teacher->name,
                        'role' => 'teacher',
                    ],
                ];
            });
        $activities = array_merge($activities, $newCourses->toArray());
        
        // Add recent homework submissions
        $submissions = HomeworkSubmission::orderBy('created_at', 'desc')
            ->with(['user', 'homework.course'])
            ->take(4)
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => 'submission_' . $submission->id,
                    'type' => 'homework',
                    'description' => $submission->user->name . ' submitted homework for ' . $submission->homework->title,
                    'created_at' => $submission->created_at,
                    'user' => [
                        'id' => $submission->user->id,
                        'name' => $submission->user->name,
                        'role' => 'student',
                    ],
                ];
            });
        $activities = array_merge($activities, $submissions->toArray());
        
        // Sort by created_at
        usort($activities, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        return array_slice($activities, 0, $limit);
    }
    
    protected function getTeacherActivity($teacherId, $limit = 10)
    {
        // For demo purposes, create sample activities relevant to a teacher
        $activities = [];
        
        // Add student submissions for this teacher's courses
        $teacher = User::find($teacherId);
        $coursesIds = $teacher->teacherCourses()->pluck('courses.id')->toArray();
        
        // Add new enrollments to teacher's courses
        $enrollments = DB::table('enrollments')
            ->whereIn('course_id', $coursesIds)
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($enrollment) {
                $student = User::find($enrollment->user_id);
                $course = Course::find($enrollment->course_id);
                
                return [
                    'id' => 'enrollment_' . $enrollment->id,
                    'type' => 'student',
                    'description' => $student->name . ' enrolled in ' . $course->title,
                    'created_at' => $enrollment->created_at,
                ];
            });
        $activities = array_merge($activities, $enrollments->toArray());
        
        // Add homework submissions from students
        $submissions = HomeworkSubmission::whereIn('homework_id', 
                Homework::whereIn('course_id', $coursesIds)->pluck('homeworks.id')
            )
            ->orderBy('created_at', 'desc')
            ->with(['user', 'homework.course'])
            ->take(5)
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => 'submission_' . $submission->id,
                    'type' => 'submission',
                    'description' => $submission->user->name . ' submitted homework for ' . $submission->homework->title,
                    'created_at' => $submission->created_at,
                ];
            });
        $activities = array_merge($activities, $submissions->toArray());
        
        // Add course updates
        $courseUpdates = Course::whereIn('id', $coursesIds)
            ->orderBy('updated_at', 'desc')
            ->take(2)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => 'course_update_' . $course->id,
                    'type' => 'course',
                    'description' => 'Course updated: ' . $course->title,
                    'created_at' => $course->updated_at,
                ];
            });
        $activities = array_merge($activities, $courseUpdates->toArray());
        
        // Sort by created_at
        usort($activities, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        return array_slice($activities, 0, $limit);
    }
    
    protected function getStudentActivity($studentId, $limit = 10)
    {
        // For demo purposes, create sample activities relevant to a student
        $activities = [];
        
        $student = User::find($studentId);
        
        // Add enrollment activities
        $enrollments = DB::table('enrollments')
            ->where('user_id', $studentId)
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($enrollment) {
                $course = Course::find($enrollment->course_id);
                
                return [
                    'id' => 'enrollment_' . $enrollment->id,
                    'type' => 'enrollment',
                    'description' => 'You enrolled in ' . $course->title,
                    'created_at' => $enrollment->created_at,
                ];
            });
        $activities = array_merge($activities, $enrollments->toArray());
        
        // Add homework submission activities
        $submissions = HomeworkSubmission::where('user_id', $studentId)
            ->orderBy('created_at', 'desc')
            ->with('homework.course')
            ->take(4)
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => 'submission_' . $submission->id,
                    'type' => 'submission',
                    'description' => 'You submitted homework for ' . $submission->homework->title,
                    'created_at' => $submission->created_at,
                ];
            });
        $activities = array_merge($activities, $submissions->toArray());
        
        // Add grade/feedback received activities
        $feedbacks = HomeworkSubmission::where('user_id', $studentId)
            ->whereNotNull('teacher_comments')
            ->orderBy('updated_at', 'desc')
            ->with('homework')
            ->take(3)
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => 'feedback_' . $submission->id,
                    'type' => 'submission',
                    'description' => 'You received feedback on ' . $submission->homework->title,
                    'created_at' => $submission->updated_at,
                ];
            });
        $activities = array_merge($activities, $feedbacks->toArray());
        
        // Sort by created_at
        usort($activities, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        return array_slice($activities, 0, $limit);
    }
} 