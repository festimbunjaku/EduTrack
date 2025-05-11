<?php

namespace Tests\Feature\Teacher;

use App\Models\Course;
use App\Models\Homework;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeworkControllerTest extends TestCase
{
    use RefreshDatabase;
    
    protected User $teacher;
    protected Course $course;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a teacher and course
        $this->teacher = User::factory()->create();
        $this->teacher->assignRole('teacher');
        
        $this->course = Course::factory()->create([
            'teacher_id' => $this->teacher->id
        ]);
    }
    
    /** @test */
    public function teacher_can_view_homework_list()
    {
        Homework::factory()->count(3)->create([
            'course_id' => $this->course->id
        ]);
        
        $response = $this->actingAs($this->teacher)
                         ->get("/teacher/courses/{$this->course->id}/homework");
                         
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Teacher/Homework/Index')
                 ->has('homework.data', 3)
        );
    }
    
    /** @test */
    public function teacher_can_create_homework()
    {
        $response = $this->actingAs($this->teacher)
                         ->post("/teacher/courses/{$this->course->id}/homework", [
                             'title' => 'Test Homework',
                             'description' => 'Test description',
                             'max_points' => 100,
                             'due_date' => now()->addWeek()->format('Y-m-d H:i:s'),
                         ]);
                         
        $response->assertRedirect("/teacher/courses/{$this->course->id}/homework");
        $response->assertSessionHas('message', 'Homework assignment created successfully.');
        
        $this->assertDatabaseHas('homework', [
            'course_id' => $this->course->id,
            'title' => 'Test Homework',
            'description' => 'Test description',
            'max_points' => 100,
        ]);
    }
    
    /** @test */
    public function teacher_can_update_homework()
    {
        $homework = Homework::factory()->create([
            'course_id' => $this->course->id,
            'title' => 'Original Title'
        ]);
        
        $response = $this->actingAs($this->teacher)
                         ->put("/teacher/homework/{$homework->id}", [
                             'title' => 'Updated Title',
                             'description' => $homework->description,
                             'max_points' => $homework->max_points,
                             'due_date' => $homework->due_date->format('Y-m-d H:i:s'),
                         ]);
                         
        $response->assertRedirect("/teacher/courses/{$this->course->id}/homework");
        $response->assertSessionHas('message', 'Homework assignment updated successfully.');
        
        $this->assertDatabaseHas('homework', [
            'id' => $homework->id,
            'title' => 'Updated Title'
        ]);
    }
    
    /** @test */
    public function teacher_cannot_update_homework_from_another_teachers_course()
    {
        // Create another teacher and course
        $anotherTeacher = User::factory()->create();
        $anotherTeacher->assignRole('teacher');
        
        $anotherCourse = Course::factory()->create([
            'teacher_id' => $anotherTeacher->id
        ]);
        
        $homework = Homework::factory()->create([
            'course_id' => $anotherCourse->id
        ]);
        
        $response = $this->actingAs($this->teacher)
                         ->put("/teacher/homework/{$homework->id}", [
                             'title' => 'Unauthorized Update',
                             'description' => $homework->description,
                             'max_points' => $homework->max_points,
                             'due_date' => $homework->due_date->format('Y-m-d H:i:s'),
                         ]);
                         
        $response->assertForbidden();
    }
    
    /** @test */
    public function teacher_can_delete_homework()
    {
        $homework = Homework::factory()->create([
            'course_id' => $this->course->id
        ]);
        
        $response = $this->actingAs($this->teacher)
                         ->delete("/teacher/homework/{$homework->id}");
                         
        $response->assertRedirect("/teacher/courses/{$this->course->id}/homework");
        $response->assertSessionHas('message', 'Homework assignment deleted successfully.');
        
        $this->assertDatabaseMissing('homework', [
            'id' => $homework->id
        ]);
    }
    
    /** @test */
    public function homework_validation_rules_are_enforced()
    {
        $response = $this->actingAs($this->teacher)
                         ->post("/teacher/courses/{$this->course->id}/homework", [
                             'title' => '', // Empty title should fail
                             'description' => '', // Empty description should fail
                             'max_points' => 'not-a-number', // Invalid points should fail
                             'due_date' => 'invalid-date', // Invalid date should fail
                         ]);
                         
        $response->assertSessionHasErrors(['title', 'description', 'max_points', 'due_date']);
    }
    
    /** @test */
    public function teacher_can_view_homework_submissions()
    {
        $homework = Homework::factory()->create([
            'course_id' => $this->course->id
        ]);
        
        // Create some submissions for this homework
        $student = User::factory()->create();
        $student->assignRole('student');
        
        $submission = $homework->submissions()->create([
            'user_id' => $student->id,
            'content' => 'Submission content',
            'submitted_at' => now(),
            'status' => 'submitted'
        ]);
        
        $response = $this->actingAs($this->teacher)
                         ->get("/teacher/homework/{$homework->id}/submissions");
                         
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Teacher/Homework/Submissions')
                 ->has('submissions.data', 1)
        );
    }
} 