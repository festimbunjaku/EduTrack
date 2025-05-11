<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Homework;
use Illuminate\Database\Seeder;

class HomeworkSeeder extends Seeder
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
        
        // Create homework assignments for each course
        foreach ($courses as $course) {
            // Create homework with past due date
            Homework::factory()
                ->withPastDueDate()
                ->count(rand(1, 2))
                ->create([
                    'course_id' => $course->id,
                ]);
                
            // Create homework with future due date
            Homework::factory()
                ->withFutureDueDate()
                ->count(rand(1, 3))
                ->create([
                    'course_id' => $course->id,
                ]);
        }
    }
} 