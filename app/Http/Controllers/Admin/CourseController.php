<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Course::query()
            ->with('teacher:id,name')
            ->withCount(['enrollments' => function($query) {
                $query->where('status', 'approved');
            }]);

        // Apply filters
        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }
        
        // Sort
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        $courses = $query->paginate(10)
            ->withQueryString();

        $teachers = User::role('teacher')->select('id', 'name')->get();

        $filters = [
            'search' => $request->search,
            'status' => $request->status,
            'teacher_id' => $request->teacher_id,
            'sort_field' => $sortField,
            'sort_direction' => $sortDirection,
        ];

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
            'teachers' => $teachers,
            'filters' => $filters,
            'statuses' => [
                Course::STATUS_UPCOMING => 'Upcoming',
                Course::STATUS_ACTIVE => 'Active',
                Course::STATUS_COMPLETED => 'Completed',
                Course::STATUS_CANCELLED => 'Cancelled',
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $teachers = User::role('teacher')->select('id', 'name')->get();
        
        return Inertia::render('Admin/Courses/Create', [
            'teachers' => $teachers,
            'statuses' => [
                Course::STATUS_UPCOMING => 'Upcoming',
                Course::STATUS_ACTIVE => 'Active',
                Course::STATUS_COMPLETED => 'Completed',
                Course::STATUS_CANCELLED => 'Cancelled',
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'feature_1' => 'required|string|max:255',
            'feature_2' => 'required|string|max:255',
            'feature_3' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'schedule' => 'required|array',
            'teacher_id' => 'required|exists:users,id',
            'max_enrollment' => 'required|integer|min:1|max:20',
            'status' => ['required', Rule::in(['upcoming', 'active', 'completed', 'cancelled'])],
            'location' => 'required|string|max:255',
            'image' => 'nullable|image|max:1024',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('courses', 'public');
            $validated['image'] = $path;
        }

        $course = Course::create($validated);

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        $course->load(['teacher:id,name', 'enrollments.user', 'materials', 'homeworks']);
        $course->approved_enrollments_count = $course->enrollments()->where('status', 'approved')->count();
        $course->pending_enrollments_count = $course->enrollments()->where('status', 'pending')->count();
        $course->waitlisted_enrollments_count = $course->enrollments()->where('status', 'waitlisted')->count();
        
        return Inertia::render('Admin/Courses/Show', [
            'course' => $course,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course)
    {
        $teachers = User::role('teacher')->select('id', 'name')->get();
        
        return Inertia::render('Admin/Courses/Edit', [
            'course' => $course,
            'teachers' => $teachers,
            'statuses' => [
                Course::STATUS_UPCOMING => 'Upcoming',
                Course::STATUS_ACTIVE => 'Active',
                Course::STATUS_COMPLETED => 'Completed',
                Course::STATUS_CANCELLED => 'Cancelled',
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'feature_1' => 'required|string|max:255',
            'feature_2' => 'required|string|max:255',
            'feature_3' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'schedule' => 'required|array',
            'teacher_id' => 'required|exists:users,id',
            'max_enrollment' => 'required|integer|min:1|max:20',
            'status' => ['required', Rule::in(['upcoming', 'active', 'completed', 'cancelled'])],
            'location' => 'required|string|max:255',
            'image' => 'nullable|image|max:1024',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
            }
            
            $path = $request->file('image')->store('courses', 'public');
            $validated['image'] = $path;
        }

        $course->update($validated);

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        // Delete course image if exists
        if ($course->image) {
            Storage::disk('public')->delete($course->image);
        }
        
        $course->delete();

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course deleted successfully.');
    }
}
