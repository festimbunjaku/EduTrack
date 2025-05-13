<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomeworkController extends Controller
{
    /**
     * Display a listing of all homework for the student.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get IDs of courses the student is enrolled in
        $enrolledCourseIds = Enrollment::where('user_id', $user->id)
            ->where('enrollments.status', 'approved')
            ->pluck('course_id');
        
        // Get all homework from enrolled courses
        $homeworks = Homework::whereIn('course_id', $enrolledCourseIds)
            ->with(['course:id,title,image'])
            ->get()
            ->map(function ($homework) use ($user) {
                // Check if homework is submitted
                $submission = HomeworkSubmission::where('homework_id', $homework->id)
                    ->where('user_id', $user->id)
                    ->first();
                
                // Fix: Use due_date if available, otherwise use deadline, and ensure it's a valid date
                $dueDate = null;
                if ($homework->due_date) {
                    $dueDate = $homework->due_date;
                } else if ($homework->deadline) {
                    $dueDate = $homework->deadline;
                } else {
                    $dueDate = now(); // Fallback in case both are null
                }
                
                return [
                    'id' => $homework->id,
                    'title' => $homework->title,
                    'due_date' => $dueDate->format('Y-m-d H:i:s'),
                    'is_submitted' => $submission ? true : false,
                    'is_graded' => $submission && $submission->status === 'graded',
                    'grade' => $submission && $submission->status === 'graded' ? $submission->grade : null,
                    'course' => [
                        'id' => $homework->course->id,
                        'title' => $homework->course->title,
                        'image' => $homework->course->image,
                    ],
                ];
            });
        
        // Count upcoming, completed and overdue homework
        $now = now();
        $upcomingCount = $homeworks->filter(function ($homework) use ($now) {
            return !$homework['is_submitted'] && strtotime($homework['due_date']) > strtotime($now);
        })->count();
        
        $completedCount = $homeworks->filter(function ($homework) {
            return $homework['is_submitted'] || $homework['is_graded'];
        })->count();
        
        $overdueCount = $homeworks->filter(function ($homework) use ($now) {
            return !$homework['is_submitted'] && strtotime($homework['due_date']) < strtotime($now);
        })->count();
        
        return Inertia::render('Student/Homework/Index', [
            'homeworks' => $homeworks,
            'upcoming_count' => $upcomingCount,
            'completed_count' => $completedCount,
            'overdue_count' => $overdueCount,
        ]);
    }

    /**
     * Display the specified homework.
     */
    public function show(Homework $homework)
    {
        $course = $homework->course;
        
        // Ensure the authenticated student is enrolled in this course
        $enrollment = Enrollment::where('course_id', $course->id)
            ->where('user_id', Auth::id())
            ->where('enrollments.status', 'approved')
            ->first();

        if (!$enrollment) {
            abort(403, 'You are not enrolled in this course.');
        }

        // Get the student's submission for this homework
        $submission = HomeworkSubmission::where('homework_id', $homework->id)
            ->where('user_id', Auth::id())
            ->first();
            
        // Fix for due date handling - properly handle both cases
        if ($homework->due_date) {
            $dueDate = $homework->due_date;
        } else {
            $dueDate = $homework->deadline;
        }
        
        $isExpired = now()->gt($dueDate);
        
        // Check for approaching deadline
        $isDeadlineApproaching = false;
        if (!$isExpired && !$submission) {
            $warningTime = now()->addHours(24);
            $isDeadlineApproaching = $warningTime->gt($dueDate);
        }
        
        // Make a copy of the homework and set the due_date explicitly for the frontend
        $homeworkData = $homework->toArray();
        $homeworkData['due_date'] = $dueDate->format('Y-m-d H:i:s');

        return Inertia::render('Student/Homework/Show', [
            'course' => $course,
            'homework' => $homeworkData,
            'submission' => $submission,
            'isExpired' => $isExpired,
            'isDeadlineApproaching' => $isDeadlineApproaching,
        ]);
    }

    /**
     * Submit homework assignment.
     */
    public function submit(Request $request, Homework $homework)
    {
        $course = $homework->course;
        
        // Ensure the authenticated student is enrolled in this course
        $enrollment = Enrollment::where('course_id', $course->id)
            ->where('user_id', Auth::id())
            ->where('enrollments.status', 'approved')
            ->first();

        if (!$enrollment) {
            abort(403, 'You are not enrolled in this course.');
        }

        // Fix for due date handling - properly handle both cases
        if ($homework->due_date) {
            $dueDate = $homework->due_date;
        } else {
            $dueDate = $homework->deadline;
        }
        
        // Strict deadline enforcement
        if (now()->gt($dueDate)) {
            return redirect()->back()->with('error', 'The deadline for this homework has passed. Late submissions are not accepted.');
        }

        // Check for approaching deadline (within 1 hour) and warn the student
        $warningWindow = now()->addHour();
        if ($warningWindow->gt($dueDate)) {
            session()->flash('warning', 'Deadline is approaching! You have less than 1 hour to submit this homework.');
        }

        $request->validate([
            'content' => 'required|string',
            'attachment' => 'nullable|file|max:10240',
        ]);

        // Check if student has already submitted
        $existingSubmission = HomeworkSubmission::where('homework_id', $homework->id)
            ->where('user_id', Auth::id())
            ->first();

        if ($existingSubmission) {
            // Update existing submission
            $existingSubmission->content = $request->content;
            
            if ($request->hasFile('attachment')) {
                // Delete old attachment if exists
                if ($existingSubmission->attachment) {
                    Storage::disk('public')->delete($existingSubmission->attachment);
                }
                
                $attachmentPath = $request->file('attachment')->store('homework_submissions', 'public');
                $existingSubmission->attachment = $attachmentPath;
            }
            
            $existingSubmission->submitted_at = now();
            $existingSubmission->status = 'submitted'; // Reset status on resubmission
            $existingSubmission->save();

            return redirect()->route('student.homework.show', $homework->id)
                ->with('success', 'Homework resubmitted successfully.');
        } else {
            // Create new submission
            $submission = new HomeworkSubmission();
            $submission->homework_id = $homework->id;
            $submission->user_id = Auth::id();
            $submission->content = $request->content;
            
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('homework_submissions', 'public');
                $submission->attachment = $attachmentPath;
            }
            
            $submission->submitted_at = now();
            $submission->status = 'submitted';
            $submission->save();

            return redirect()->route('student.homework.show', $homework->id)
                ->with('success', 'Homework submitted successfully.');
        }
    }

    /**
     * Download homework attachment
     */
    public function downloadAttachment($homeworkId)
    {
        $homework = Homework::findOrFail($homeworkId);
        
        // Make sure user is authorized
        $user = Auth::user();
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $homework->course_id)
            ->where('enrollments.status', 'approved')
            ->first();
            
        if (!$enrollment) {
            abort(403, 'You do not have access to this course');
        }
        
        // Check if homework has attachment
        if (!$homework->file_path) {
            abort(404, 'No attachment found for this homework');
        }
        
        $filePath = Storage::disk('public')->path($homework->file_path);
        
        if (!file_exists($filePath)) {
            abort(404, 'File not found');
        }
        
        // Return file download
        return response()->download(
            $filePath,
            $homework->title . '.' . pathinfo($filePath, PATHINFO_EXTENSION),
            ['Content-Type' => mime_content_type($filePath)]
        );
    }
}
