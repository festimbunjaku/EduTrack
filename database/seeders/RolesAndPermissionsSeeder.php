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

        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $teacherRole = Role::create(['name' => 'teacher']);
        $studentRole = Role::create(['name' => 'student']);

        // Create permissions
        // Admin permissions
        $manageUsers = Permission::create(['name' => 'manage users']);
        $manageRoles = Permission::create(['name' => 'manage roles']);
        $managePermissions = Permission::create(['name' => 'manage permissions']);
        $viewAllCourses = Permission::create(['name' => 'view all courses']);
        
        // Teacher permissions
        $createCourse = Permission::create(['name' => 'create course']);
        $editCourse = Permission::create(['name' => 'edit course']);
        $deleteCourse = Permission::create(['name' => 'delete course']);
        $viewEnrolledStudents = Permission::create(['name' => 'view enrolled students']);
        $gradeStudents = Permission::create(['name' => 'grade students']);
        
        // Student permissions
        $enrollCourse = Permission::create(['name' => 'enroll course']);
        $viewEnrolledCourses = Permission::create(['name' => 'view enrolled courses']);
        $submitAssignment = Permission::create(['name' => 'submit assignment']);
        
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

        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@edutrack.com',
            'password' => Hash::make('12345678')
        ]);
        $admin->assignRole('admin');

        // Create teacher users
        for ($i = 1; $i <= 3; $i++) {
            $teacher = User::create([
                'name' => "Teacher $i",
                'email' => "teacher$i@edutrack.com",
                'password' => Hash::make('12345678')
            ]);
            $teacher->assignRole('teacher');
        }

        // Create student users
        for ($i = 1; $i <= 6; $i++) {
            $student = User::create([
                'name' => "Student $i",
                'email' => "student$i@edutrack.com",
                'password' => Hash::make('12345678')
            ]);
            $student->assignRole('student');
        }
    }
}
