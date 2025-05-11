<?php

namespace Tests\Unit\Models;

use App\Models\Course;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeworkTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_a_course()
    {
        $course = Course::factory()->create();
        
        $homework = Homework::factory()->create([
            'course_id' => $course->id
        ]);
        
        $this->assertInstanceOf(Course::class, $homework->course);
        $this->assertEquals($course->id, $homework->course->id);
    }
    
    /** @test */
    public function it_has_many_submissions()
    {
        $homework = Homework::factory()->create();
        $student = User::factory()->create();
        $student->assignRole('student');
        
        HomeworkSubmission::factory()->count(3)->create([
            'homework_id' => $homework->id,
            'user_id' => $student->id
        ]);
        
        $this->assertCount(3, $homework->submissions);
        $this->assertInstanceOf(HomeworkSubmission::class, $homework->submissions->first());
    }
    
    /** @test */
    public function it_can_check_if_past_due()
    {
        $pastDueHomework = Homework::factory()->withPastDueDate()->create();
        $futureDueHomework = Homework::factory()->withFutureDueDate()->create();
        
        $this->assertTrue($pastDueHomework->isPastDue());
        $this->assertFalse($futureDueHomework->isPastDue());
    }
    
    /** @test */
    public function it_can_get_due_status()
    {
        $pastDueHomework = Homework::factory()->withPastDueDate()->create();
        $futureDueHomework = Homework::factory()->withFutureDueDate()->create();
        
        $this->assertEquals('past_due', $pastDueHomework->getDueStatus());
        $this->assertEquals('upcoming', $futureDueHomework->getDueStatus());
    }
    
    /** @test */
    public function it_can_check_if_student_has_submitted()
    {
        $homework = Homework::factory()->create();
        $student1 = User::factory()->create();
        $student1->assignRole('student');
        $student2 = User::factory()->create();
        $student2->assignRole('student');
        
        HomeworkSubmission::factory()->create([
            'homework_id' => $homework->id,
            'user_id' => $student1->id
        ]);
        
        $this->assertTrue($homework->hasSubmissionFrom($student1));
        $this->assertFalse($homework->hasSubmissionFrom($student2));
    }
} 