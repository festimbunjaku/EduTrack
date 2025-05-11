<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class FourCoursesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First make sure we have a teacher
        $teacher = User::firstOrCreate(
            ['email' => 'teacher@example.com'],
            [
                'name' => 'Professor Smith',
                'email' => 'teacher@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Make sure the teacher role exists
        $teacherRole = Role::firstOrCreate(['name' => 'teacher']);
        if (!$teacher->hasRole('teacher')) {
            $teacher->assignRole('teacher');
        }

        // Create 4 courses
        $courses = [
            [
                'title' => 'Introduction to Web Development',
                'description' => 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
                'feature_1' => 'Learn HTML5 and CSS3',
                'feature_2' => 'Build responsive websites',
                'feature_3' => 'JavaScript fundamentals',
                'price' => 99.99,
                'start_date' => Carbon::now()->addDays(5),
                'end_date' => Carbon::now()->addMonths(3),
                'schedule' => json_encode(['Monday' => '18:00-20:00', 'Wednesday' => '18:00-20:00']),
                'teacher_id' => $teacher->id,
                'max_enrollment' => 25,
                'status' => 'upcoming',
                'location' => 'Online',
                'image' => 'courses/web-dev.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Data Structures and Algorithms',
                'description' => 'Master the essential data structures and algorithms needed for efficient programming.',
                'feature_1' => 'Arrays, Lists, and Trees',
                'feature_2' => 'Sorting and Searching Algorithms',
                'feature_3' => 'Problem-solving techniques',
                'price' => 129.99,
                'start_date' => Carbon::now()->subDays(15),
                'end_date' => Carbon::now()->addMonths(2),
                'schedule' => json_encode(['Tuesday' => '19:00-21:00', 'Thursday' => '19:00-21:00']),
                'teacher_id' => $teacher->id,
                'max_enrollment' => 20,
                'status' => 'active',
                'location' => 'Hybrid',
                'image' => 'courses/dsa.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Advanced Machine Learning',
                'description' => 'Dive deep into neural networks, deep learning, and real-world ML applications.',
                'feature_1' => 'Neural Networks',
                'feature_2' => 'Deep Learning',
                'feature_3' => 'ML Project Implementation',
                'price' => 149.99,
                'start_date' => Carbon::now()->subMonths(1),
                'end_date' => Carbon::now()->addDays(15),
                'schedule' => json_encode(['Monday' => '16:00-18:00', 'Friday' => '16:00-18:00']),
                'teacher_id' => $teacher->id,
                'max_enrollment' => 15,
                'status' => 'active',
                'location' => 'Online',
                'image' => 'courses/ml.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Mobile App Development with React Native',
                'description' => 'Build cross-platform mobile applications using React Native and JavaScript.',
                'feature_1' => 'React and React Native fundamentals',
                'feature_2' => 'Native modules integration',
                'feature_3' => 'App deployment to App Store and Google Play',
                'price' => 119.99,
                'start_date' => Carbon::now()->subMonths(3),
                'end_date' => Carbon::now()->subDays(10),
                'schedule' => json_encode(['Wednesday' => '17:00-19:00', 'Saturday' => '10:00-12:00']),
                'teacher_id' => $teacher->id,
                'max_enrollment' => 20,
                'status' => 'completed',
                'location' => 'In-person',
                'image' => 'courses/react-native.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert the courses
        foreach ($courses as $course) {
            Course::firstOrCreate(
                ['title' => $course['title']],
                $course
            );
        }

        $this->command->info('4 courses have been seeded successfully!');
    }
} 