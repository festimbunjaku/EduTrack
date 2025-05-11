<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use Illuminate\Database\Seeder;

class HomeworkSubmissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get active enrollments
        $enrollments = Enrollment::where('status', 'active')->get();
        
        if ($enrollments->isEmpty()) {
            // Use the enrollment seeder if no enrollments exist
            $this->call(EnrollmentSeeder::class);
            $enrollments = Enrollment::where('status', 'active')->get();
        }
        
        // Get all homework assignments
        $homeworks = Homework::all();
        
        if ($homeworks->isEmpty()) {
            // Use the homework seeder if no homework exists
            $this->call(HomeworkSeeder::class);
            $homeworks = Homework::all();
        }
        
        // Create homework submissions
        foreach ($enrollments as $enrollment) {
            // Get homework for this enrollment's course
            $courseHomeworks = $homeworks->where('course_id', $enrollment->course_id);
            
            if ($courseHomeworks->isEmpty()) {
                continue;
            }
            
            // Submit some of the homework (randomly)
            $homeworksToSubmit = $courseHomeworks->random(rand(1, $courseHomeworks->count()));
            
            foreach ($homeworksToSubmit as $homework) {
                // Decide if it should be graded or just submitted
                if (rand(0, 1)) {
                    HomeworkSubmission::factory()->graded()->create([
                        'homework_id' => $homework->id,
                        'user_id' => $enrollment->user_id,
                    ]);
                } else {
                    HomeworkSubmission::factory()->submitted()->create([
                        'homework_id' => $homework->id,
                        'user_id' => $enrollment->user_id,
                    ]);
                }
            }
        }
    }
} 