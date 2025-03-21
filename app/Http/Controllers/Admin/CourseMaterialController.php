<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CourseMaterialController extends Controller
{
    /**
     * Display materials for a specific course.
     */
    public function index(Course $course)
    {
        $course->load('materials');
        
        $materialTypes = [
            'document' => 'Document',
            'video' => 'Video',
            'link' => 'External Link',
            'image' => 'Image',
            'audio' => 'Audio',
            'other' => 'Other',
        ];
        
        return Inertia::render('Admin/Courses/Materials/Index', [
            'course' => $course,
            'materials' => $course->materials,
            'materialTypes' => $materialTypes,
        ]);
    }
    
    /**
     * Show the form for creating a new material.
     */
    public function create(Course $course)
    {
        $materialTypes = [
            'document' => 'Document',
            'video' => 'Video',
            'link' => 'External Link',
            'image' => 'Image',
            'audio' => 'Audio',
            'other' => 'Other',
        ];
        
        return Inertia::render('Admin/Courses/Materials/Create', [
            'course' => $course,
            'materialTypes' => $materialTypes,
        ]);
    }
    
    /**
     * Store a newly created material in storage.
     */
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:document,video,link,image,audio,other',
            'file' => $request->type !== 'link' ? 'required|file|max:10240' : 'nullable',
            'link' => $request->type === 'link' ? 'required|url' : 'nullable',
        ]);
        
        $material = new CourseMaterial([
            'course_id' => $course->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
        ]);
        
        // Handle link type
        if ($validated['type'] === 'link') {
            $material->file_path = $validated['link'];
            $material->file_name = $validated['title'];
        } 
        // Handle file upload
        else if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Store file
            $path = $file->storeAs(
                'course_materials/' . $course->id,
                $fileName,
                'public'
            );
            
            $material->file_path = $path;
            $material->file_name = $file->getClientOriginalName();
            $material->file_size = $file->getSize();
            $material->file_extension = $file->getClientOriginalExtension();
        }
        
        $material->save();
        
        return redirect()->route('admin.courses.materials.index', $course)
                         ->with('success', 'Material added successfully.');
    }
    
    /**
     * Display the specified material.
     */
    public function show(Course $course, CourseMaterial $material)
    {
        return Inertia::render('Admin/Courses/Materials/Show', [
            'course' => $course,
            'material' => $material,
        ]);
    }
    
    /**
     * Show the form for editing the specified material.
     */
    public function edit(Course $course, CourseMaterial $material)
    {
        $materialTypes = [
            'document' => 'Document',
            'video' => 'Video',
            'link' => 'External Link',
            'image' => 'Image',
            'audio' => 'Audio',
            'other' => 'Other',
        ];
        
        return Inertia::render('Admin/Courses/Materials/Edit', [
            'course' => $course,
            'material' => $material,
            'materialTypes' => $materialTypes,
        ]);
    }
    
    /**
     * Update the specified material in storage.
     */
    public function update(Request $request, Course $course, CourseMaterial $material)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:document,video,link,image,audio,other',
            'file' => $request->hasFile('file') ? 'file|max:10240' : 'nullable',
            'link' => $request->type === 'link' ? 'required_without:file|url' : 'nullable',
        ]);
        
        $material->title = $validated['title'];
        $material->description = $validated['description'] ?? null;
        $material->type = $validated['type'];
        
        // Handle link type
        if ($validated['type'] === 'link' && isset($validated['link'])) {
            // Remove old file if changing from file to link
            if ($material->file_path && !str_starts_with($material->file_path, 'http')) {
                Storage::disk('public')->delete($material->file_path);
            }
            
            $material->file_path = $validated['link'];
            $material->file_name = $validated['title'];
            $material->file_size = null;
            $material->file_extension = null;
        } 
        // Handle file upload
        else if ($request->hasFile('file')) {
            // Remove old file
            if ($material->file_path && !str_starts_with($material->file_path, 'http')) {
                Storage::disk('public')->delete($material->file_path);
            }
            
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Store file
            $path = $file->storeAs(
                'course_materials/' . $course->id,
                $fileName,
                'public'
            );
            
            $material->file_path = $path;
            $material->file_name = $file->getClientOriginalName();
            $material->file_size = $file->getSize();
            $material->file_extension = $file->getClientOriginalExtension();
        }
        
        $material->save();
        
        return redirect()->route('admin.courses.materials.index', $course)
                         ->with('success', 'Material updated successfully.');
    }
    
    /**
     * Remove the specified material from storage.
     */
    public function destroy(Course $course, CourseMaterial $material)
    {
        // Delete file if it exists
        if ($material->file_path && !str_starts_with($material->file_path, 'http')) {
            Storage::disk('public')->delete($material->file_path);
        }
        
        $material->delete();
        
        return redirect()->route('admin.courses.materials.index', $course)
                         ->with('success', 'Material deleted successfully.');
    }
    
    /**
     * Download the material file.
     */
    public function download(Course $course, CourseMaterial $material)
    {
        // Check if it's a file (not a link)
        if (!$material->file_path || str_starts_with($material->file_path, 'http')) {
            return redirect()->back()->with('error', 'This material cannot be downloaded.');
        }
        
        // Check if file exists
        if (!Storage::disk('public')->exists($material->file_path)) {
            return redirect()->back()->with('error', 'File not found.');
        }
        
        return Storage::disk('public')->download(
            $material->file_path, 
            $material->file_name
        );
    }
} 