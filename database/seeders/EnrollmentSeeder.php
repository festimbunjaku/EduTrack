<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class EnrollmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // Get students
        $students = User::role('student')->get();
        
        if ($students->isEmpty()) {
            // Create students if none exist
            for ($i = 0; $i < 5; $i++) {
                $student = User::factory()->create();
                $student->assignRole('student');
                $students->push($student);
            }
        }
        
        // Get published courses
        $courses = Course::where('status', 'published')->get();
        
        if ($courses->isEmpty()) {
            // Use the course seeder if no courses exist
            $this->call(CourseSeeder::class);
            $courses = Course::where('status', 'published')->get();
        }
        
        // Create enrollments
        foreach ($students as $student) {
            // Enroll each student in 1-3 courses
            $coursesToEnroll = $courses->random(rand(1, min(3, $courses->count())));
            
            foreach ($coursesToEnroll as $course) {
                // Mix of active, completed, and withdrawn enrollments
                $status = $faker->randomElement(['active', 'completed', 'withdrawn']);
                
                $completionPercentage = match ($status) {
                    'active' => $faker->numberBetween(10, 90),
                    'completed' => 100,
                    'withdrawn' => $faker->numberBetween(0, 50),
                };
                
                Enrollment::factory()->create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'status' => $status,
                    'completion_percentage' => $completionPercentage,
                ]);
            }
        }
    }
} 