<?php

namespace Tests\Unit\Models;

use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeworkSubmissionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_a_user()
    {
        $student = User::factory()->create();
        $student->assignRole('student');
        
        $submission = HomeworkSubmission::factory()->create([
            'user_id' => $student->id
        ]);
        
        $this->assertInstanceOf(User::class, $submission->user);
        $this->assertEquals($student->id, $submission->user->id);
    }
    
    /** @test */
    public function it_belongs_to_a_homework()
    {
        $homework = Homework::factory()->create();
        
        $submission = HomeworkSubmission::factory()->create([
            'homework_id' => $homework->id
        ]);
        
        $this->assertInstanceOf(Homework::class, $submission->homework);
        $this->assertEquals($homework->id, $submission->homework->id);
    }
    
    /** @test */
    public function it_has_correct_status_scopes()
    {
        HomeworkSubmission::factory()->submitted()->create();
        HomeworkSubmission::factory()->graded()->create();
        
        $this->assertCount(1, HomeworkSubmission::submitted()->get());
        $this->assertCount(1, HomeworkSubmission::graded()->get());
    }
    
    /** @test */
    public function it_can_determine_if_is_graded()
    {
        $gradedSubmission = HomeworkSubmission::factory()->graded()->create();
        $submittedSubmission = HomeworkSubmission::factory()->submitted()->create();
        
        $this->assertTrue($gradedSubmission->isGraded());
        $this->assertFalse($submittedSubmission->isGraded());
    }
    
    /** @test */
    public function it_auto_sets_submitted_at_on_creation()
    {
        $submission = HomeworkSubmission::factory()->create([
            'submitted_at' => null
        ]);
        
        $this->assertNotNull($submission->submitted_at);
    }
    
    /** @test */
    public function it_can_calculate_grade_percentage()
    {
        $homework = Homework::factory()->create(['max_points' => 100]);
        
        $submission = HomeworkSubmission::factory()->graded()->create([
            'homework_id' => $homework->id,
            'grade' => 75
        ]);
        
        $this->assertEquals(75, $submission->gradePercentage());
    }
}