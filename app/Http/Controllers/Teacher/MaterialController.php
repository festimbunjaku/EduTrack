<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MaterialController extends Controller
{
    /**
     * Display a listing of the materials for a specific course.
     */
    public function index(Course $course)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to manage materials for this course.');
        }

        $materials = CourseMaterial::where('course_id', $course->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Teacher/Materials/Index', [
            'course' => $course,
            'materials' => $materials,
        ]);
    }

    /**
     * Display all materials for all courses taught by the teacher
     */
    public function teacherMaterials()
    {
        $teacherId = Auth::id();
        
        // Get courses taught by the teacher
        $courses = Course::where('teacher_id', $teacherId)->get();
        
        $materials = CourseMaterial::whereHas('course', function ($query) use ($teacherId) {
            $query->where('teacher_id', $teacherId);
        })->with('course')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Teacher/Materials/AllMaterials', [
            'courses' => $courses,
            'materials' => $materials,
            'courseCount' => $courses->count(),
            'materialTypes' => $materials->groupBy('type')->map->count(),
        ]);
    }

    /**
     * Show the form for creating a new material.
     */
    public function create(Course $course)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to create materials for this course.');
        }

        return Inertia::render('Teacher/Materials/Create', [
            'course' => $course,
        ]);
    }

    /**
     * Store a newly created material in storage.
     */
    public function store(Request $request, Course $course)
    {
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to create materials for this course.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:document,video,link',
            'file' => 'required_if:type,document,video|file|max:20480',
            'url' => 'required_if:type,link|url',
        ]);

        $material = new CourseMaterial();
        $material->course_id = $course->id;
        $material->title = $request->title;
        $material->description = $request->description;
        $material->type = $request->type;

        // Handle file upload
        if ($request->type === 'document' || $request->type === 'video') {
            if ($request->hasFile('file')) {
                $filePath = $request->file('file')->store('course_materials', 'public');
                $material->file_path = $filePath;
            }
        } else if ($request->type === 'link') {
            $material->url = $request->url;
        }

        $material->save();

        return redirect()->route('teacher.courses.materials.index', $course->id)
            ->with('success', 'Material created successfully.');
    }

    /**
     * Display the specified material.
     */
    public function show(Course $course = null, CourseMaterial $material = null)
    {
        // If material is directly accessed via the standalone route
        if (!$course && $material) {
            $material = $material ?? request()->route('material');
            $course = $material->course;
        } else if ($course && !$material) {
            // If material is accessed via the nested route
            $material = request()->route('material');
        }
        
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to view this material.');
        }

        // Ensure the material belongs to the specified course
        if ($material->course_id !== $course->id) {
            abort(404, 'Material not found in this course.');
        }

        return Inertia::render('Teacher/Materials/Show', [
            'course' => $course,
            'material' => $material,
        ]);
    }

    /**
     * Show the form for editing the specified material.
     */
    public function edit(Course $course = null, CourseMaterial $material = null)
    {
        // If material is directly accessed via the standalone route
        if (!$course && $material) {
            $material = $material ?? request()->route('material');
            $course = $material->course;
        } else if ($course && !$material) {
            // If material is accessed via the nested route
            $material = request()->route('material');
        }
        
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to edit this material.');
        }

        // Ensure the material belongs to the specified course
        if ($material->course_id !== $course->id) {
            abort(404, 'Material not found in this course.');
        }

        return Inertia::render('Teacher/Materials/Edit', [
            'course' => $course,
            'material' => $material,
        ]);
    }

    /**
     * Update the specified material in storage.
     */
    public function update(Request $request, Course $course = null, CourseMaterial $material = null)
    {
        // If material is directly accessed via the standalone route
        if (!$course && $material) {
            $material = $material ?? request()->route('material');
            $course = $material->course;
        } else if ($course && !$material) {
            // If material is accessed via the nested route
            $material = request()->route('material');
        }
        
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to update this material.');
        }

        // Ensure the material belongs to the specified course
        if ($material->course_id !== $course->id) {
            abort(404, 'Material not found in this course.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:document,video,link',
            'file' => 'nullable|file|max:20480',
            'url' => 'required_if:type,link|url',
        ]);

        $material->title = $request->title;
        $material->description = $request->description;
        $material->type = $request->type;

        // Handle file upload if type is document or video
        if ($request->type === 'document' || $request->type === 'video') {
            if ($request->hasFile('file')) {
                // Delete old file if exists
                if ($material->file_path) {
                    Storage::disk('public')->delete($material->file_path);
                }
                
                $filePath = $request->file('file')->store('course_materials', 'public');
                $material->file_path = $filePath;
                $material->url = null;
            }
        } else if ($request->type === 'link') {
            // If type is changed to link, delete any existing file
            if ($material->file_path) {
                Storage::disk('public')->delete($material->file_path);
                $material->file_path = null;
            }
            $material->url = $request->url;
        }

        $material->save();

        if ($request->route('course')) {
            return redirect()->route('teacher.courses.materials.index', $course->id)
                ->with('success', 'Material updated successfully.');
        } else {
            return redirect()->route('teacher.materials.show', $material->id)
                ->with('success', 'Material updated successfully.');
        }
    }

    /**
     * Remove the specified material from storage.
     */
    public function destroy(Request $request, Course $course = null, CourseMaterial $material = null)
    {
        // If material is directly accessed via the standalone route
        if (!$course && $material) {
            $material = $material ?? request()->route('material');
            $course = $material->course;
        } else if ($course && !$material) {
            // If material is accessed via the nested route
            $material = request()->route('material');
        }
        
        // Ensure the authenticated teacher is the owner of this course
        if ($course->teacher_id !== Auth::id()) {
            abort(403, 'You do not have permission to delete this material.');
        }

        // Ensure the material belongs to the specified course
        if ($material->course_id !== $course->id) {
            abort(404, 'Material not found in this course.');
        }

        // Delete the file if it exists
        if ($material->file_path) {
            Storage::disk('public')->delete($material->file_path);
        }

        // Delete the material
        $material->delete();

        if ($request->route('course')) {
            return redirect()->route('teacher.courses.materials.index', $course->id)
                ->with('success', 'Material deleted successfully.');
        } else {
            return redirect()->route('teacher.materials.index')
                ->with('success', 'Material deleted successfully.');
        }
    }
}
