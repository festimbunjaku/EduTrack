<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guest cannot view courses list', function () {
    $response = $this->get('/courses');
    
    $response->assertRedirect('/login');
});

test('authenticated user can view published courses', function () {
    $student = createTestStudent();
    Course::factory()->published()->count(3)->create();
    Course::factory()->draft()->count(2)->create();
    
    $response = $this->actingAs($student)->get('/courses');
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('Student/Courses/Index')
             ->has('courses.data', 3)
    );
});

test('student can enroll in a course', function () {
    $student = createTestStudent();
    $course = Course::factory()->published()->create();
    
    $response = $this->actingAs($student)
                     ->post("/courses/{$course->id}/enroll");
    
    $response->assertRedirect("/courses/{$course->id}");
    $this->assertDatabaseHas('enrollments', [
        'user_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active'
    ]);
});

test('teacher can create a course', function () {
    Storage::fake('public');
    $teacher = createTestTeacher();
    
    $response = $this->actingAs($teacher)
                     ->post('/teacher/courses', [
                         'title' => 'New Test Course',
                         'description' => 'Course description',
                         'status' => 'draft',
                         'start_date' => now()->addDay()->toDateString(),
                         'end_date' => now()->addMonth()->toDateString(),
                         'enrollment_limit' => 20,
                         'price' => 99.99,
                         'difficulty_level' => 'intermediate',
                         'cover_image' => UploadedFile::fake()->image('cover.jpg')
                     ]);
    
    $response->assertRedirect('/teacher/courses');
    $this->assertDatabaseHas('courses', [
        'title' => 'New Test Course',
        'teacher_id' => $teacher->id,
        'status' => 'draft'
    ]);
});

test('teacher can update their course', function () {
    $teacher = createTestTeacher();
    $course = Course::factory()->create(['teacher_id' => $teacher->id]);
    
    $response = $this->actingAs($teacher)
                     ->put("/teacher/courses/{$course->id}", [
                         'title' => 'Updated Course Title',
                         'description' => $course->description,
                         'status' => $course->status,
                         'start_date' => $course->start_date,
                         'end_date' => $course->end_date,
                         'enrollment_limit' => $course->enrollment_limit,
                         'price' => $course->price,
                         'difficulty_level' => $course->difficulty_level
                     ]);
    
    $response->assertRedirect("/teacher/courses/{$course->id}");
    $this->assertDatabaseHas('courses', [
        'id' => $course->id,
        'title' => 'Updated Course Title'
    ]);
});

test('teacher cannot update courses they do not own', function () {
    $teacher = createTestTeacher();
    $anotherTeacher = createTestTeacher();
    $course = Course::factory()->create(['teacher_id' => $anotherTeacher->id]);
    
    $response = $this->actingAs($teacher)
                     ->put("/teacher/courses/{$course->id}", [
                         'title' => 'Unauthorized Update',
                         'description' => $course->description,
                         'status' => $course->status,
                         'start_date' => $course->start_date,
                         'end_date' => $course->end_date,
                         'enrollment_limit' => $course->enrollment_limit,
                         'price' => $course->price,
                         'difficulty_level' => $course->difficulty_level
                     ]);
    
    $response->assertForbidden();
    $this->assertDatabaseMissing('courses', [
        'id' => $course->id,
        'title' => 'Unauthorized Update'
    ]);
});

test('course validation rules are enforced', function () {
    $teacher = createTestTeacher();
    
    $response = $this->actingAs($teacher)
                     ->post('/teacher/courses', [
                         'title' => '', // Empty title should fail validation
                         'description' => 'Course description',
                         'status' => 'invalid_status', // Invalid status should fail
                         'start_date' => now()->addDay()->toDateString(),
                         'end_date' => now()->subDay()->toDateString(), // End date before start date should fail
                         'enrollment_limit' => 'not_a_number', // Not a number should fail
                         'price' => -10, // Negative price should fail
                         'difficulty_level' => 'invalid_level' // Invalid level should fail
                     ]);
    
    $response->assertSessionHasErrors(['title', 'status', 'end_date', 'enrollment_limit', 'price', 'difficulty_level']);
}); 