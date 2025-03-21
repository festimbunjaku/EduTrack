<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomeworkController extends Controller
{
    /**
     * Display homework assignments for a specific course.
     */
    public function index(Course $course)
    {
        $course->load('homeworks');
        
        return Inertia::render('Admin/Courses/Homework/Index', [
            'course' => $course,
            'homeworks' => $course->homeworks,
        ]);
    }
    
    /**
     * Show the form for creating a new homework assignment.
     */
    public function create(Course $course)
    {
        return Inertia::render('Admin/Courses/Homework/Create', [
            'course' => $course,
        ]);
    }
    
    /**
     * Store a newly created homework assignment in storage.
     */
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'deadline' => 'required|date|after:today',
            'attachment' => 'nullable|file|max:10240',
        ]);
        
        $homework = new Homework([
            'course_id' => $course->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'deadline' => $validated['deadline'],
        ]);
        
        // Handle file upload if present
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Store file
            $path = $file->storeAs(
                'homework_attachments/' . $course->id,
                $fileName,
                'public'
            );
            
            $homework->attachment_path = $path;
        }
        
        $homework->save();
        
        return redirect()->route('admin.courses.homework.index', $course)
                         ->with('success', 'Homework assignment created successfully.');
    }
    
    /**
     * Display the specified homework assignment.
     */
    public function show(Course $course, Homework $homework)
    {
        $homework->load(['submissions.user']);
        
        return Inertia::render('Admin/Courses/Homework/Show', [
            'course' => $course,
            'homework' => $homework,
            'submissionStats' => [
                'total' => $homework->submissions->count(),
                'pending' => $homework->submissions->where('status', HomeworkSubmission::STATUS_PENDING)->count(),
                'approved' => $homework->submissions->where('status', HomeworkSubmission::STATUS_APPROVED)->count(),
                'denied' => $homework->submissions->where('status', HomeworkSubmission::STATUS_DENIED)->count(),
            ],
        ]);
    }
    
    /**
     * Show the form for editing the specified homework assignment.
     */
    public function edit(Course $course, Homework $homework)
    {
        return Inertia::render('Admin/Courses/Homework/Edit', [
            'course' => $course,
            'homework' => $homework,
        ]);
    }
    
    /**
     * Update the specified homework assignment in storage.
     */
    public function update(Request $request, Course $course, Homework $homework)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'deadline' => 'required|date',
            'attachment' => 'nullable|file|max:10240',
        ]);
        
        $homework->title = $validated['title'];
        $homework->description = $validated['description'];
        $homework->deadline = $validated['deadline'];
        
        // Handle file upload if present
        if ($request->hasFile('attachment')) {
            // Remove old file if it exists
            if ($homework->attachment_path) {
                Storage::disk('public')->delete($homework->attachment_path);
            }
            
            $file = $request->file('attachment');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Store file
            $path = $file->storeAs(
                'homework_attachments/' . $course->id,
                $fileName,
                'public'
            );
            
            $homework->attachment_path = $path;
        }
        
        $homework->save();
        
        return redirect()->route('admin.courses.homework.index', $course)
                         ->with('success', 'Homework assignment updated successfully.');
    }
    
    /**
     * Remove the specified homework assignment from storage.
     */
    public function destroy(Course $course, Homework $homework)
    {
        // Delete attachment if it exists
        if ($homework->attachment_path) {
            Storage::disk('public')->delete($homework->attachment_path);
        }
        
        // Delete associated submissions
        $homework->submissions()->delete();
        
        // Delete the homework
        $homework->delete();
        
        return redirect()->route('admin.courses.homework.index', $course)
                         ->with('success', 'Homework assignment deleted successfully.');
    }
    
    /**
     * Download the homework attachment.
     */
    public function downloadAttachment(Course $course, Homework $homework)
    {
        if (!$homework->attachment_path) {
            return redirect()->back()->with('error', 'This homework has no attachment.');
        }
        
        // Check if file exists
        if (!Storage::disk('public')->exists($homework->attachment_path)) {
            return redirect()->back()->with('error', 'Attachment file not found.');
        }
        
        // Extract filename from path
        $fileName = basename($homework->attachment_path);
        
        return Storage::disk('public')->download($homework->attachment_path, $fileName);
    }
    
    /**
     * Review a student's homework submission.
     */
    public function reviewSubmission(Request $request, Course $course, Homework $homework, HomeworkSubmission $submission)
    {
        $validated = $request->validate([
            'status' => 'required|in:' . HomeworkSubmission::STATUS_APPROVED . ',' . HomeworkSubmission::STATUS_DENIED,
            'teacher_comments' => 'nullable|string',
        ]);
        
        $submission->status = $validated['status'];
        $submission->teacher_comments = $validated['teacher_comments'] ?? null;
        $submission->save();
        
        return redirect()->back()->with('success', 'Submission reviewed successfully.');
    }
} 