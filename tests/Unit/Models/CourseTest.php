<?php

namespace Tests\Unit\Models;

use App\Models\Course;
use App\Models\CourseMaterial;
use App\Models\Enrollment;
use App\Models\Homework;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_a_teacher()
    {
        $teacher = User::factory()->create();
        $teacher->assignRole('teacher');
        
        $course = Course::factory()->create(['teacher_id' => $teacher->id]);
        
        $this->assertInstanceOf(User::class, $course->teacher);
        $this->assertEquals($teacher->id, $course->teacher->id);
    }
    
    /** @test */
    public function it_has_many_enrollments()
    {
        $course = Course::factory()->create();
        $student = User::factory()->create();
        $student->assignRole('student');
        
        Enrollment::factory()->count(3)->create([
            'course_id' => $course->id,
            'user_id' => $student->id
        ]);
        
        $this->assertCount(3, $course->enrollments);
        $this->assertInstanceOf(Enrollment::class, $course->enrollments->first());
    }
    
    /** @test */
    public function it_has_many_materials()
    {
        $course = Course::factory()->create();
        
        CourseMaterial::factory()->count(5)->create([
            'course_id' => $course->id
        ]);
        
        $this->assertCount(5, $course->materials);
        $this->assertInstanceOf(CourseMaterial::class, $course->materials->first());
    }
    
    /** @test */
    public function it_has_many_homework_assignments()
    {
        $course = Course::factory()->create();
        
        Homework::factory()->count(3)->create([
            'course_id' => $course->id
        ]);
        
        $this->assertCount(3, $course->homework);
        $this->assertInstanceOf(Homework::class, $course->homework->first());
    }
    
    /** @test */
    public function it_can_be_filtered_by_status()
    {
        Course::factory()->published()->create();
        Course::factory()->draft()->create();
        Course::factory()->archived()->create();
        
        $this->assertCount(1, Course::published()->get());
        $this->assertCount(1, Course::draft()->get());
        $this->assertCount(1, Course::archived()->get());
    }
    
    /** @test */
    public function it_can_determine_if_is_published()
    {
        $publishedCourse = Course::factory()->published()->create();
        $draftCourse = Course::factory()->draft()->create();
        
        $this->assertTrue($publishedCourse->isPublished());
        $this->assertFalse($draftCourse->isPublished());
    }
    
    /** @test */
    public function it_can_determine_if_enrollment_is_open()
    {
        $openCourse = Course::factory()->create([
            'status' => 'published',
            'enrollment_limit' => 10
        ]);
        
        $closedCourse = Course::factory()->create([
            'status' => 'draft',
            'enrollment_limit' => 10
        ]);
        
        $this->assertTrue($openCourse->isEnrollmentOpen());
        $this->assertFalse($closedCourse->isEnrollmentOpen());
    }
} 