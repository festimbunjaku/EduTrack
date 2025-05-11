<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            UsersSeeder::class,
            RoomSeeder::class,
            CourseSeeder::class,
            CourseMaterialSeeder::class,
            EnrollmentSeeder::class,
            HomeworkSeeder::class,
            HomeworkSubmissionSeeder::class,
            DefaultCertificateTemplateSeeder::class,
            CertificateSeeder::class,
        ]);
    }
}
