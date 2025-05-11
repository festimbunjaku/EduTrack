<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get teachers
        $teachers = User::role('teacher')->get();
        
        if ($teachers->isEmpty()) {
            // Create a teacher if none exists
            $teacher = User::factory()->create();
            $teacher->assignRole('teacher');
            $teachers = collect([$teacher]);
        }
        
        // Create 10 courses with different statuses
        foreach ($teachers as $teacher) {
            // Create published courses
            Course::factory()->count(3)
                ->published()
                ->for($teacher, 'teacher')
                ->create();
                
            // Create draft courses
            Course::factory()->count(2)
                ->draft()
                ->for($teacher, 'teacher')
                ->create();
                
            // Create archived courses
            Course::factory()->count(1)
                ->archived()
                ->for($teacher, 'teacher')
                ->create();
        }
    }
} 