<?php

namespace Tests\Unit\Models;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_a_user()
    {
        $student = User::factory()->create();
        $student->assignRole('student');
        
        $enrollment = Enrollment::factory()->create([
            'user_id' => $student->id
        ]);
        
        $this->assertInstanceOf(User::class, $enrollment->user);
        $this->assertEquals($student->id, $enrollment->user->id);
    }
    
    /** @test */
    public function it_belongs_to_a_course()
    {
        $course = Course::factory()->create();
        
        $enrollment = Enrollment::factory()->create([
            'course_id' => $course->id
        ]);
        
        $this->assertInstanceOf(Course::class, $enrollment->course);
        $this->assertEquals($course->id, $enrollment->course->id);
    }
    
    /** @test */
    public function it_has_correct_status_scopes()
    {
        Enrollment::factory()->active()->create();
        Enrollment::factory()->completed()->create();
        Enrollment::factory()->withdrawn()->create();
        
        $this->assertCount(1, Enrollment::active()->get());
        $this->assertCount(1, Enrollment::completed()->get());
        $this->assertCount(1, Enrollment::withdrawn()->get());
    }
    
    /** @test */
    public function it_can_determine_if_is_active()
    {
        $activeEnrollment = Enrollment::factory()->active()->create();
        $completedEnrollment = Enrollment::factory()->completed()->create();
        
        $this->assertTrue($activeEnrollment->isActive());
        $this->assertFalse($completedEnrollment->isActive());
    }
    
    /** @test */
    public function it_can_determine_if_is_completed()
    {
        $activeEnrollment = Enrollment::factory()->active()->create(['completion_percentage' => 50]);
        $completedEnrollment = Enrollment::factory()->completed()->create();
        
        $this->assertFalse($activeEnrollment->isCompleted());
        $this->assertTrue($completedEnrollment->isCompleted());
    }
    
    /** @test */
    public function it_auto_sets_enrolled_at_on_creation()
    {
        $enrollment = Enrollment::factory()->create([
            'enrolled_at' => null
        ]);
        
        $this->assertNotNull($enrollment->enrolled_at);
    }
} 