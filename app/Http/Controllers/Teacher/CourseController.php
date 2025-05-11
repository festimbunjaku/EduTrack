<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display a listing of the teacher's courses.
     */
    public function index(Request $request)
    {
        $view = $request->input('view');
        
        // Handle materials view differently
        if ($view === 'materials') {
            // Get all materials from all courses taught by this teacher
            $courses = Course::where('teacher_id', Auth::id())
                ->with(['materials' => function($query) {
                    $query->orderBy('created_at', 'desc');
                }])
                ->get();
                
            return Inertia::render('Teacher/Materials/AllMaterials', [
                'courses' => $courses,
            ]);
        }
        
        $query = Course::query()
            ->where('teacher_id', Auth::id())
            ->withCount(['enrollments' => function($query) {
                $query->where('status', 'approved');
            }]);

        // Apply filters
        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        // Sort
        $sortField = $request->input('sort_field', 'start_date');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        $courses = $query->get();

        $filters = [
            'search' => $request->search,
            'status' => $request->status,
            'sort_field' => $sortField,
            'sort_direction' => $sortDirection,
        ];

        $statuses = [
            'upcoming' => 'Upcoming',
            'active' => 'Active',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
        ];

        return Inertia::render('Teacher/Courses/Index', [
            'courses' => $courses,
            'filters' => $filters,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Display the specified course.
     */
    public function show(Course $course)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to view this course.');
        }

        $course->load(['materials', 'homeworks', 'enrollments.user']);
        $course->approved_enrollments_count = $course->enrollments()->where('status', 'approved')->count();
        $course->pending_enrollments_count = $course->enrollments()->where('status', 'pending')->count();
        $course->waitlisted_enrollments_count = $course->enrollments()->where('status', 'waitlisted')->count();
        
        return Inertia::render('Teacher/Courses/Show', [
            'course' => $course,
        ]);
    }

    /**
     * Returns a list of students enrolled in a specific course.
     */
    public function students(Course $course)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to view students for this course.');
        }

        $enrollments = Enrollment::query()
            ->with('user')
            ->where('course_id', $course->id)
            ->where('status', 'approved')
            ->get();

        return Inertia::render('Teacher/Courses/Students', [
            'course' => $course,
            'enrollments' => $enrollments,
        ]);
    }
}
