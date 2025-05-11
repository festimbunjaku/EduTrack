<?php

namespace Database\Seeders;

use App\Models\Certificate;
use App\Models\Enrollment;
use Illuminate\Database\Seeder;

class CertificateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get completed enrollments
        $completedEnrollments = Enrollment::where('status', 'completed')
            ->where('completion_percentage', 100)
            ->get();
        
        if ($completedEnrollments->isEmpty()) {
            // Use the enrollment seeder if no completed enrollments exist
            $this->call(EnrollmentSeeder::class);
            $completedEnrollments = Enrollment::where('status', 'completed')
                ->where('completion_percentage', 100)
                ->get();
        }
        
        // Create certificates for completed enrollments
        foreach ($completedEnrollments as $enrollment) {
            Certificate::factory()->create([
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
            ]);
        }
    }
} 