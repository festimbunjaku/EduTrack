<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('guest cannot access dashboard', function () {
    $response = $this->get('/dashboard');
    
    $response->assertRedirect('/login');
});

test('student can access dashboard', function () {
    $student = createTestStudent();
    
    $response = $this->actingAs($student)->get('/dashboard');
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('dashboard'));
});

test('teacher can access dashboard', function () {
    $teacher = createTestTeacher();
    
    $response = $this->actingAs($teacher)->get('/dashboard');
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('dashboard'));
});

test('admin can access dashboard', function () {
    $admin = createTestAdmin();
    
    $response = $this->actingAs($admin)->get('/dashboard');
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('dashboard'));
});

test('student dashboard shows enrolled courses', function () {
    $student = createTestStudent();
    $course = Course::factory()->published()->create();
    
    Enrollment::factory()->create([
        'user_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active'
    ]);
    
    $response = $this->actingAs($student)->get('/dashboard');
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('dashboard')
             ->has('enrolledCourses', 1)
             ->where('enrolledCourses.0.id', $course->id)
    );
});

test('teacher dashboard shows created courses', function () {
    $teacher = createTestTeacher();
    
    Course::factory()->count(3)->create([
        'teacher_id' => $teacher->id
    ]);
    
    $response = $this->actingAs($teacher)->get('/dashboard');
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('dashboard')
             ->has('teacherCourses', 3)
    );
});

test('dashboard shows correct user role', function () {
    $student = createTestStudent();
    
    $response = $this->actingAs($student)->get('/dashboard');
    
    $response->assertInertia(fn ($page) => 
        $page->where('userRole', 'student')
    );
    
    $teacher = createTestTeacher();
    
    $response = $this->actingAs($teacher)->get('/dashboard');
    
    $response->assertInertia(fn ($page) => 
        $page->where('userRole', 'teacher')
    );
});