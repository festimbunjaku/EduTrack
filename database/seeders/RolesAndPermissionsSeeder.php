<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles if they don't exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $teacherRole = Role::firstOrCreate(['name' => 'teacher']);
        $studentRole = Role::firstOrCreate(['name' => 'student']);

        // Create permissions if they don't exist
        // Admin permissions
        $manageUsers = Permission::firstOrCreate(['name' => 'manage users']);
        $manageRoles = Permission::firstOrCreate(['name' => 'manage roles']);
        $managePermissions = Permission::firstOrCreate(['name' => 'manage permissions']);
        $viewAllCourses = Permission::firstOrCreate(['name' => 'view all courses']);
        
        // Teacher permissions
        $createCourse = Permission::firstOrCreate(['name' => 'create course']);
        $editCourse = Permission::firstOrCreate(['name' => 'edit course']);
        $deleteCourse = Permission::firstOrCreate(['name' => 'delete course']);
        $viewEnrolledStudents = Permission::firstOrCreate(['name' => 'view enrolled students']);
        $gradeStudents = Permission::firstOrCreate(['name' => 'grade students']);
        
        // Student permissions
        $enrollCourse = Permission::firstOrCreate(['name' => 'enroll course']);
        $viewEnrolledCourses = Permission::firstOrCreate(['name' => 'view enrolled courses']);
        $submitAssignment = Permission::firstOrCreate(['name' => 'submit assignment']);
        
        // Assign permissions to roles
        $adminRole->givePermissionTo([
            $manageUsers, $manageRoles, $managePermissions, $viewAllCourses,
            $createCourse, $editCourse, $deleteCourse, $viewEnrolledStudents,
            $gradeStudents, $enrollCourse, $viewEnrolledCourses, $submitAssignment
        ]);
        
        $teacherRole->givePermissionTo([
            $createCourse, $editCourse, $deleteCourse, $viewEnrolledStudents,
            $gradeStudents, $viewEnrolledCourses
        ]);
        
        $studentRole->givePermissionTo([
            $enrollCourse, $viewEnrolledCourses, $submitAssignment
        ]);

        // Check if we already have users
        if (User::count() > 0) {
            $this->command->info('Users already exist, skipping user creation.');
            return;
        }

        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@edutrack.com',
            'password' => Hash::make('12345678'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        // Create teacher users
        for ($i = 1; $i <= 3; $i++) {
            $teacher = User::create([
                'name' => "Teacher $i",
                'email' => "teacher$i@edutrack.com",
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
            ]);
            $teacher->assignRole('teacher');
        }

        // Create student users
        for ($i = 1; $i <= 6; $i++) {
            $student = User::create([
                'name' => "Student $i",
                'email' => "student$i@edutrack.com",
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
            ]);
            $student->assignRole('student');
        }
    }
}
