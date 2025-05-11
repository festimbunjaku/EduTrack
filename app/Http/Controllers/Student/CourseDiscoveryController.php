<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CourseDiscoveryController extends Controller
{
    /**
     * Display a listing of available courses.
     */
    public function index(Request $request)
    {
        $query = Course::query()
            ->with('teacher')
            ->withCount(['enrollments' => function($query) {
                $query->where('status', 'approved');
            }]);

        // Check enrolled courses
        $enrolledCourseIds = Auth::user()->enrolledCourses()->pluck('courses.id');
        
        // Apply filters
        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        if ($request->filled('teacher')) {
            $query->where('teacher_id', $request->teacher);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('price')) {
            switch ($request->price) {
                case 'free':
                    $query->where('price', 0);
                    break;
                case 'paid':
                    $query->where('price', '>', 0);
                    break;
                case 'under_50':
                    $query->where('price', '<', 50);
                    break;
                case '50_100':
                    $query->whereBetween('price', [50, 100]);
                    break;
                case 'over_100':
                    $query->where('price', '>', 100);
                    break;
            }
        }

        // Get all teachers for the filter
        $teachers = \App\Models\User::role('teacher')
            ->orderBy('name')
            ->get(['id', 'name']);

        $courses = $query->latest()->get()->map(function ($course) use ($enrolledCourseIds) {
            return [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'features' => [
                    $course->feature_1,
                    $course->feature_2,
                    $course->feature_3,
                ],
                'price' => $course->price,
                'status' => $course->status,
                'teacher' => [
                    'id' => $course->teacher->id,
                    'name' => $course->teacher->name,
                ],
                'enrolled_students_count' => $course->enrollments_count,
                'max_enrollment' => $course->max_enrollment,
                'duration' => $course->duration,
                'is_enrolled' => $enrolledCourseIds->contains($course->id),
                'has_pending_request' => Enrollment::where('user_id', Auth::id())
                    ->where('course_id', $course->id)
                    ->where('status', 'pending')
                    ->exists()
            ];
        });

        return Inertia::render('Student/Courses/Discover', [
            'courses' => $courses,
            'filters' => [
                'search' => $request->search,
                'teacher' => $request->teacher,
                'status' => $request->status,
                'price' => $request->price,
            ],
            'teachers' => $teachers,
            'statuses' => [
                'upcoming' => 'Upcoming',
                'active' => 'Active',
                'completed' => 'Completed',
            ],
        ]);
    }

    /**
     * Display the specified course.
     */
    public function show(Course $course)
    {
        $course->load('teacher');
        
        // Get enrolled students count
        $enrolledStudentsCount = $course->enrollments()
            ->where('status', 'approved')
            ->count();
            
        $isEnrolled = Auth::user()->enrolledCourses()
            ->where('courses.id', $course->id)
            ->exists();
            
        $hasPendingRequest = Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->where('status', 'pending')
            ->exists();

        // Check the actual format of the schedule
        $scheduleDebug = [
            'raw' => $course->schedule,
            'type' => gettype($course->schedule),
            'isString' => is_string($course->schedule),
            'isArray' => is_array($course->schedule),
        ];

        // Ensure features are parsed properly
        $features = array_filter([
            $course->feature_1,
            $course->feature_2,
            $course->feature_3,
        ]);

        // Create a properly formatted course object
        $formattedCourse = array_merge($course->toArray(), [
            'is_enrolled' => $isEnrolled,
            'has_pending_request' => $hasPendingRequest,
            'schedule_debug' => $scheduleDebug,
            'features' => $features,
            'prerequisites' => [],  // Add prerequisites if you have them
            'syllabus' => [],       // Add syllabus if you have it
            'enrolled_students_count' => $enrolledStudentsCount,
        ]);

        return Inertia::render('Student/Courses/DiscoverShow', [
            'course' => $formattedCourse
        ]);
    }

    /**
     * Request enrollment in a course.
     */
    public function requestEnrollment(Course $course)
    {
        // Check if already enrolled
        if (Auth::user()->enrolledCourses()->where('courses.id', $course->id)->exists()) {
            return back()->with('error', 'You are already enrolled in this course.');
        }

        // Check existing enrollment records
        $existingEnrollment = \App\Models\Enrollment::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->latest()
            ->first();

        // If there's an existing enrollment, check its status
        if ($existingEnrollment) {
            // If it's pending or approved or waitlisted, don't allow new enrollment
            if (in_array($existingEnrollment->status, ['pending', 'approved', 'waitlisted'])) {
                $status = match($existingEnrollment->status) {
                    'pending' => 'You already have a pending enrollment request for this course.',
                    'approved' => 'You are already enrolled in this course.',
                    'waitlisted' => 'You are currently on the waitlist for this course.',
                    default => 'You already have an enrollment record for this course.'
                };
                return back()->with('error', $status);
            }
            
            // If it was denied, update the existing record instead of creating a new one
            if ($existingEnrollment->status === 'denied') {
                $existingEnrollment->update([
                    'status' => 'pending',
                    'notes' => 'Student requested enrollment again after previous denial',
                    'waitlist_position' => null
                ]);
                return back()->with('success', 'Enrollment request submitted successfully.');
            }
        }

        // Create new enrollment request
        \App\Models\Enrollment::create([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'status' => 'pending',
            'notes' => 'Student requested enrollment'
        ]);

        return back()->with('success', 'Enrollment request submitted successfully.');
    }
}
