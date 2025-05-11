<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseMaterial;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;

class MaterialController extends Controller
{
    /**
     * Display a listing of all materials from enrolled courses.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get IDs of courses the student is enrolled in
        $enrolledCourseIds = Enrollment::where('user_id', $user->id)
            ->where('enrollments.status', 'approved')
            ->pluck('course_id');
        
        // Get all materials from enrolled courses
        $materials = CourseMaterial::whereIn('course_id', $enrolledCourseIds)
            ->with('course:id,title,image')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($material) {
                return [
                    'id' => $material->id,
                    'title' => $material->title,
                    'description' => $material->description,
                    'type' => $material->type,
                    'file_path' => $material->file_path,
                    'created_at' => $material->created_at->format('Y-m-d'),
                    'course' => [
                        'id' => $material->course->id,
                        'title' => $material->course->title,
                        'image' => $material->course->image,
                    ],
                ];
            });
        
        // Group materials by course using first() for course data access instead of array notation
        $courseGroups = $materials->groupBy(function ($item) {
            return $item['course']['title'];
        })->map(function ($items) {
            return [
                'course_id' => $items->first()['course']['id'],
                'course_title' => $items->first()['course']['title'],
                'course_image' => $items->first()['course']['image'],
                'materials_count' => $items->count(),
                'materials' => $items->take(3),
            ];
        })->values();
        
        $recentMaterials = $materials->take(5);
        
        // Count materials by type
        $typeStats = [
            'document' => $materials->where('type', 'document')->count(),
            'video' => $materials->where('type', 'video')->count(),
            'link' => $materials->where('type', 'link')->count(),
            'other' => $materials->whereNotIn('type', ['document', 'video', 'link'])->count(),
        ];
        
        return Inertia::render('Student/Materials/Index', [
            'materials' => $materials,
            'recent_materials' => $recentMaterials,
            'course_groups' => $courseGroups,
            'total_count' => $materials->count(),
            'type_stats' => $typeStats,
        ]);
    }

    /**
     * Display the specified material.
     */
    public function show(CourseMaterial $material)
    {
        $user = Auth::user();
        
        // Ensure the authenticated student is enrolled in this course
        $enrollment = Enrollment::where('course_id', $material->course_id)
            ->where('user_id', $user->id)
            ->where('enrollments.status', 'approved')
            ->first();

        if (!$enrollment) {
            abort(403, 'You are not enrolled in this course.');
        }

        $course = $material->course;
        
        // Get other materials from the same course
        $relatedMaterials = CourseMaterial::where('course_id', $course->id)
            ->where('id', '!=', $material->id)
            ->take(3)
            ->get();

        return Inertia::render('Student/Materials/Show', [
            'course' => $course,
            'material' => $material,
            'related_materials' => $relatedMaterials,
        ]);
    }
    
    /**
     * Download material file.
     */
    public function download(CourseMaterial $material)
    {
        $user = Auth::user();
        
        // Ensure the authenticated student is enrolled in this course
        $enrollment = Enrollment::where('course_id', $material->course_id)
            ->where('user_id', $user->id)
            ->where('enrollments.status', 'approved')
            ->first();

        if (!$enrollment) {
            abort(403, 'You are not enrolled in this course.');
        }
        
        // Ensure material has a file to download
        if (!$material->file_path) {
            abort(404, 'No file available for this material.');
        }
        
        $filePath = Storage::disk('public')->path($material->file_path);
        
        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }
        
        return Response::download($filePath, $material->title);
    }
}
