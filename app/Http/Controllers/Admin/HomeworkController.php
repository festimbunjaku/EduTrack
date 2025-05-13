<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HomeworkController extends Controller
{
    /**
     * Status constants for homework submissions
     */
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_DENIED = 'denied';
    
    /**
     * Display a listing of all homework assignments across all courses.
     */
    public function allHomework()
    {
        $homeworks = Homework::with(['course', 'submissions'])->withCount('submissions')->get();
        
        return Inertia::render('Admin/Homework/AllHomework', [
            'homeworks' => $homeworks,
        ]);
    }
    
    /**
     * Display homework assignments for a specific course.
     */
    public function index(Course $course)
    {
        // If 'all' is passed as the parameter, show all homework assignments
        if ($course->id === 'all') {
            $homeworks = Homework::with('course')->orderBy('created_at', 'desc')->get();
            
            return Inertia::render('Admin/Homework/AllHomework', [
                'homeworks' => $homeworks,
            ]);
        }
        
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
            $homework->attachment_name = $file->getClientOriginalName();
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
                'pending' => $homework->submissions->where('status', self::STATUS_PENDING)->count(),
                'approved' => $homework->submissions->where('status', self::STATUS_APPROVED)->count(),
                'denied' => $homework->submissions->where('status', self::STATUS_DENIED)->count(),
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
            $homework->attachment_name = $file->getClientOriginalName();
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
        
        return response()->download(storage_path('app/public/' . $homework->attachment_path), $fileName);
    }
    
    /**
     * Download the homework attachment (alias for downloadAttachment).
     */
    public function download(Course $course, Homework $homework)
    {
        return $this->downloadAttachment($course, $homework);
    }
    
    /**
     * Review a student's homework submission.
     */
    public function reviewSubmission(Request $request, Course $course, Homework $homework, HomeworkSubmission $submission)
    {
        $validated = $request->validate([
            'status' => 'required|in:' . self::STATUS_APPROVED . ',' . self::STATUS_DENIED,
            'teacher_comments' => 'nullable|string',
        ]);
        
        $submission->status = $validated['status'];
        $submission->teacher_comments = $validated['teacher_comments'] ?? null;
        $submission->save();
        
        return redirect()->back()->with('success', 'Submission reviewed successfully.');
    }
    
    /**
     * Display a specific homework assignment regardless of course (admin-only).
     */
    public function showAny(Homework $homework)
    {
        $homework->load(['course', 'submissions.user']);
        
        return Inertia::render('Admin/Homework/Show', [
            'homework' => $homework,
            'course' => $homework->course,
            'submissionStats' => [
                'total' => $homework->submissions->count(),
                'pending' => $homework->submissions->where('status', self::STATUS_PENDING)->count(),
                'approved' => $homework->submissions->where('status', self::STATUS_APPROVED)->count(),
                'denied' => $homework->submissions->where('status', self::STATUS_DENIED)->count(),
            ],
        ]);
    }
    
    /**
     * Show the form for editing any homework assignment regardless of course (admin-only).
     */
    public function editAny(Homework $homework)
    {
        $homework->load('course');
        
        return Inertia::render('Admin/Homework/Edit', [
            'homework' => $homework,
            'course' => $homework->course,
        ]);
    }
    
    /**
     * Update any homework assignment regardless of course (admin-only).
     */
    public function updateAny(Request $request, Homework $homework)
    {
        $course = $homework->course;
        
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
            $homework->attachment_name = $file->getClientOriginalName();
        }
        
        $homework->save();
        
        return redirect()->route('admin.all.homework.index')
                         ->with('success', 'Homework assignment updated successfully.');
    }
    
    /**
     * Remove any homework assignment regardless of course (admin-only).
     */
    public function destroyAny(Homework $homework)
    {
        // Delete attachment if it exists
        if ($homework->attachment_path) {
            Storage::disk('public')->delete($homework->attachment_path);
        }
        
        // Delete associated submissions
        $homework->submissions()->delete();
        
        // Delete the homework
        $homework->delete();
        
        return redirect()->route('admin.all.homework.index')
                         ->with('success', 'Homework assignment deleted successfully.');
    }
    
    /**
     * Show homework creation form for any course (admin only)
     */
    public function createAny()
    {
        $courses = Course::select('id', 'title')->get();
        
        return Inertia::render('Admin/Homework/Create', [
            'courses' => $courses,
        ]);
    }
    
    /**
     * Store a new homework for any course (admin only)
     */
    public function storeAny(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'course_id' => 'required|exists:courses,id',
            'deadline' => 'required|date|after:now',
            'max_score' => 'required|numeric|min:1',
            'attachment' => 'nullable|file|max:10240',
        ]);
        
        $homework = new Homework([
            'course_id' => $validated['course_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'deadline' => $validated['deadline'],
            'max_score' => $validated['max_score'],
        ]);
        
        // Handle file attachment
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Store file
            $path = $file->storeAs(
                'homework_attachments/' . $validated['course_id'],
                $fileName,
                'public'
            );
            
            $homework->attachment_path = $path;
            $homework->attachment_name = $file->getClientOriginalName();
        }
        
        $homework->save();
        
        return redirect()->route('admin.all.homework.index')
                         ->with('success', 'Homework assignment created successfully.');
    }
    
    /**
     * Download the homework attachment for any homework regardless of course (admin-only).
     */
    public function downloadAttachmentAny(Homework $homework)
    {
        if (!$homework->attachment_path) {
            return redirect()->back()->with('error', 'This homework has no attachment.');
        }
        
        // Check if file exists
        if (!Storage::disk('public')->exists($homework->attachment_path)) {
            return redirect()->back()->with('error', 'Attachment file not found.');
        }
        
        // Use original filename if available, otherwise extract filename from path
        $fileName = $homework->attachment_name ?? basename($homework->attachment_path);
        
        return response()->download(storage_path('app/public/' . $homework->attachment_path), $fileName);
    }
    
    /**
     * Review a student's homework submission for any homework regardless of course (admin-only).
     */
    public function reviewSubmissionAny(Request $request, Homework $homework, HomeworkSubmission $submission)
    {
        $validated = $request->validate([
            'status' => 'required|in:' . self::STATUS_APPROVED . ',' . self::STATUS_DENIED,
            'teacher_comments' => 'nullable|string',
        ]);
        
        $submission->status = $validated['status'];
        $submission->teacher_comments = $validated['teacher_comments'] ?? null;
        $submission->save();
        
        return redirect()->back()->with('success', 'Submission reviewed successfully.');
    }
    
    /**
     * Show a specific student submission.
     * 
     * This method is called from two routes:
     * 1. /admin/all/homework/{homeworkId}/submissions/{submission}
     * 2. /admin/courses/{course}/homework/{homeworkId}/submissions/{submission}
     */
    public function showSubmission()
    {
        // Debug logging to see what arguments are being received
        $args = func_get_args();
        Log::info('showSubmission called with args:', [
            'args_count' => count($args),
            'args_dump' => $args
        ]);

        // Try to identify each argument
        foreach ($args as $index => $arg) {
            Log::info("Arg $index:", [
                'type' => gettype($arg),
                'class' => is_object($arg) ? get_class($arg) : 'not an object',
                'value' => is_scalar($arg) ? $arg : 'non-scalar',
            ]);
        }

        $course = null;
        $homeworkId = null;
        $submission = null;
        
        // Determine argument types based on route pattern
        foreach ($args as $arg) {
            if ($arg instanceof Course) {
                $course = $arg;
            } elseif ($arg instanceof HomeworkSubmission) {
                $submission = $arg;
            } elseif (is_string($arg) || is_numeric($arg)) {
                $homeworkId = $arg;
            }
        }
        
        // Log what we detected
        Log::info('Detected parameters:', [
            'course' => $course ? $course->id : null,
            'homeworkId' => $homeworkId,
            'submission' => $submission ? $submission->id : null,
        ]);
        
        // Validate that we have the required parameters
        if (!$homeworkId || !$submission) {
            Log::error('Missing required parameters for showSubmission');
            abort(404, 'Invalid parameters');
        }
        
        try {
            // Retrieve the homework model from the database using the ID
            $homework = Homework::findOrFail($homeworkId);
            
            // Ensure the submission belongs to the specified homework
            if ($submission->homework_id != $homework->id) {
                Log::error('Submission does not belong to homework', [
                    'submission_homework_id' => $submission->homework_id,
                    'homework_id' => $homework->id
                ]);
                abort(404, 'Submission not found for this homework.');
            }
            
            // Load related data
            $submission->load('user');
            $homework->load('course');
            
            // Determine which view to render based on whether course is provided
            if ($course) {
                Log::info('Rendering course-specific view');
                return Inertia::render('Admin/Courses/Homework/Submission', [
                    'course' => $course,
                    'homework' => $homework,
                    'submission' => $submission,
                ]);
            } else {
                Log::info('Rendering general view');
                return Inertia::render('Admin/Homework/Submission', [
                    'homework' => $homework,
                    'submission' => $submission,
                    'course' => $homework->course,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception in showSubmission: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
} 