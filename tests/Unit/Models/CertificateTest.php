<?php

namespace Tests\Unit\Models;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CertificateTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_a_user()
    {
        $student = User::factory()->create();
        $student->assignRole('student');
        
        $certificate = Certificate::factory()->create([
            'user_id' => $student->id
        ]);
        
        $this->assertInstanceOf(User::class, $certificate->user);
        $this->assertEquals($student->id, $certificate->user->id);
    }
    
    /** @test */
    public function it_belongs_to_a_course()
    {
        $course = Course::factory()->create();
        
        $certificate = Certificate::factory()->create([
            'course_id' => $course->id
        ]);
        
        $this->assertInstanceOf(Course::class, $certificate->course);
        $this->assertEquals($course->id, $certificate->course->id);
    }
    
    /** @test */
    public function it_has_a_unique_certificate_number()
    {
        $certificate1 = Certificate::factory()->create();
        $certificate2 = Certificate::factory()->create();
        
        $this->assertNotEquals($certificate1->certificate_number, $certificate2->certificate_number);
    }
    
    /** @test */
    public function it_auto_sets_issued_at_on_creation()
    {
        $certificate = Certificate::factory()->create([
            'issued_at' => null
        ]);
        
        $this->assertNotNull($certificate->issued_at);
    }
    
    /** @test */
    public function it_can_check_if_belongs_to_student()
    {
        $student1 = User::factory()->create();
        $student1->assignRole('student');
        $student2 = User::factory()->create();
        $student2->assignRole('student');
        
        $certificate = Certificate::factory()->create([
            'user_id' => $student1->id
        ]);
        
        $this->assertTrue($certificate->belongsToUser($student1));
        $this->assertFalse($certificate->belongsToUser($student2));
    }
} 