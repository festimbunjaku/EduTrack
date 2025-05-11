<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display a listing of the student's enrolled courses.
     */
    public function index(Request $request)
    {
        $query = Enrollment::query()
            ->where('user_id', Auth::id())
            ->where('enrollments.status', 'approved')
            ->with('course')
            ->join('courses', 'enrollments.course_id', '=', 'courses.id')
            ->select('enrollments.*', 'courses.title', 'courses.status');

        // Apply filters
        if ($request->filled('search')) {
            $query->where('courses.title', 'like', "%{$request->search}%");
        }
        
        if ($request->filled('status')) {
            $query->where('courses.status', $request->status);
        }
        
        // Sort
        $sortField = $request->input('sort_field', 'courses.start_date');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        $enrollments = $query->get();

        $courses = $enrollments->map(function ($enrollment) {
            return $enrollment->course;
        });

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

        return Inertia::render('Student/Courses/Index', [
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
        // Ensure the authenticated student is enrolled in this course
        $enrollment = Enrollment::where('course_id', $course->id)
            ->where('user_id', Auth::id())
            ->where('enrollments.status', 'approved')
            ->first();

        if (!$enrollment) {
            abort(403, 'You are not enrolled in this course.');
        }

        $course->load(['teacher', 'materials', 'homeworks']);

        // Add debug info about schedule
        Log::info('Course schedule type', [
            'course_id' => $course->id,
            'schedule' => $course->schedule,
            'type' => gettype($course->schedule),
        ]);

        // Get the student's submissions for this course's homework
        $homeworkIds = $course->homeworks->pluck('id')->toArray();
        
        $submissions = [];
        if (!empty($homeworkIds)) {
            $submissions = Auth::user()->homeworkSubmissions()
                ->whereIn('homework_id', $homeworkIds)
                ->get()
                ->keyBy('homework_id');
        }

        // Add submission data to each homework
        $homeworks = $course->homeworks->map(function ($homework) use ($submissions) {
            $homework->student_submission = $submissions[$homework->id] ?? null;
            return $homework;
        });

        // Check if student has a certificate for this course
        $certificate = Auth::user()->certificates()
            ->where('course_id', $course->id)
            ->first();

        return Inertia::render('Student/Courses/Show', [
            'course' => $course,
            'homeworks' => $homeworks,
            'certificate' => $certificate,
        ]);
    }
}
