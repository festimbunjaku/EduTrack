<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomeworkController extends Controller
{
    /**
     * Display a listing of the homeworks for a specific course.
     */
    public function index(Course $course)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to manage homework for this course.');
        }

        $homeworks = Homework::where('course_id', $course->id)
            ->withCount(['submissions'])
            ->orderBy('due_date', 'desc')
            ->get();

        return Inertia::render('Teacher/Homework/Index', [
            'course' => $course,
            'homeworks' => $homeworks,
        ]);
    }

    /**
     * Show the form for creating a new homework.
     */
    public function create(Course $course)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to create homework for this course.');
        }

        return Inertia::render('Teacher/Homework/Create', [
            'course' => $course,
        ]);
    }

    /**
     * Store a newly created homework in storage.
     */
    public function store(Request $request, Course $course)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to create homework for this course.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'due_date' => 'required|date',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $homework = new Homework();
        $homework->course_id = $course->id;
        $homework->title = $request->title;
        $homework->description = $request->description;
        $homework->due_date = $request->due_date;
        $homework->deadline = $request->due_date;

        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('homework_attachments', 'public');
            $homework->attachment = $attachmentPath;
        }

        $homework->save();

        return redirect()->route('teacher.courses.homework.index', $course->id)
            ->with('success', 'Homework created successfully.');
    }

    /**
     * Display the specified homework.
     */
    public function show(Course $course, Homework $homework)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to view this homework.');
        }

        // Ensure the homework belongs to the specified course
        if ($homework->course_id !== $course->id) {
            abort(404, 'Homework not found in this course.');
        }

        $homework->load(['submissions.user']);

        return Inertia::render('Teacher/Homework/Show', [
            'course' => $course,
            'homework' => $homework,
        ]);
    }

    /**
     * Show the form for editing the specified homework.
     */
    public function edit(Course $course, Homework $homework)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to edit this homework.');
        }

        // Ensure the homework belongs to the specified course
        if ($homework->course_id !== $course->id) {
            abort(404, 'Homework not found in this course.');
        }

        return Inertia::render('Teacher/Homework/Edit', [
            'course' => $course,
            'homework' => $homework,
        ]);
    }

    /**
     * Update the specified homework in storage.
     */
    public function update(Request $request, Course $course, Homework $homework)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to update this homework.');
        }

        // Ensure the homework belongs to the specified course
        if ($homework->course_id !== $course->id) {
            abort(404, 'Homework not found in this course.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'due_date' => 'required|date',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $homework->title = $request->title;
        $homework->description = $request->description;
        $homework->due_date = $request->due_date;
        $homework->deadline = $request->due_date;

        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($homework->attachment) {
                Storage::disk('public')->delete($homework->attachment);
            }
            
            $attachmentPath = $request->file('attachment')->store('homework_attachments', 'public');
            $homework->attachment = $attachmentPath;
        }

        $homework->save();

        return redirect()->route('teacher.courses.homework.index', $course->id)
            ->with('success', 'Homework updated successfully.');
    }

    /**
     * Remove the specified homework from storage.
     */
    public function destroy(Course $course, Homework $homework)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to delete this homework.');
        }

        // Ensure the homework belongs to the specified course
        if ($homework->course_id !== $course->id) {
            abort(404, 'Homework not found in this course.');
        }

        // Delete the attachment if it exists
        if ($homework->attachment) {
            Storage::disk('public')->delete($homework->attachment);
        }

        // Delete the homework
        $homework->delete();

        return redirect()->route('teacher.courses.homework.index', $course->id)
            ->with('success', 'Homework deleted successfully.');
    }

    /**
     * Review a student's homework submission.
     */
    public function reviewSubmission(Request $request, Course $course, Homework $homework, HomeworkSubmission $submission)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to review submissions for this course.');
        }

        // Ensure the homework belongs to the specified course
        if ($homework->course_id !== $course->id) {
            abort(404, 'Homework not found in this course.');
        }

        // Ensure the submission belongs to the specified homework
        if ($submission->homework_id !== $homework->id) {
            abort(404, 'Submission not found for this homework.');
        }

        $request->validate([
            'grade' => 'required|integer|min:0|max:100',
            'feedback' => 'required|string',
        ]);

        $submission->grade = $request->grade;
        $submission->feedback = $request->feedback;
        $submission->graded_at = now();
        $submission->save();

        return redirect()->back()->with('success', 'Submission reviewed successfully.');
    }
    
    /**
     * Display all pending homework submissions for the teacher.
     */
    public function pendingReviews()
    {
        $user = Auth::user();
        
        // Get pending submissions for all courses taught by this teacher
        $pendingSubmissions = HomeworkSubmission::whereHas('homework', function ($query) use ($user) {
            $query->whereHas('course', function ($q) use ($user) {
                $q->where('teacher_id', $user->id);
            });
        })
        ->where('status', 'submitted')
        ->with(['homework.course', 'user'])
        ->latest()
        ->get();
        
        // Group by course
        $courseGroups = $pendingSubmissions->groupBy(function ($submission) {
            return $submission->homework->course->id;
        })->map(function ($submissions, $courseId) {
            $course = $submissions->first()->homework->course;
            return [
                'course' => $course,
                'submissions' => $submissions,
                'count' => $submissions->count(),
            ];
        })->values();
        
        return Inertia::render('Teacher/Homework/PendingReviews', [
            'courseGroups' => $courseGroups,
            'totalPending' => $pendingSubmissions->count(),
        ]);
    }
}
