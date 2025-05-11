<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseMaterial;
use Illuminate\Database\Seeder;

class CourseMaterialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get published courses
        $courses = Course::where('status', 'published')->get();
        
        if ($courses->isEmpty()) {
            // Use the course seeder if no courses exist
            $this->call(CourseSeeder::class);
            $courses = Course::where('status', 'published')->get();
        }
        
        // Create course materials for each course
        foreach ($courses as $course) {
            // Create a video lecture
            CourseMaterial::factory()
                ->video()
                ->count(rand(2, 4))
                ->create([
                    'course_id' => $course->id,
                ]);
                
            // Create a document
            CourseMaterial::factory()
                ->document()
                ->count(rand(2, 3))
                ->create([
                    'course_id' => $course->id,
                ]);
                
            // Create a quiz
            CourseMaterial::factory()
                ->quiz()
                ->count(rand(1, 2))
                ->create([
                    'course_id' => $course->id,
                ]);
        }
    }
} 