<?php

namespace Tests\Unit\Models;

use App\Models\Course;
use App\Models\CourseMaterial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseMaterialTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_a_course()
    {
        $course = Course::factory()->create();
        
        $material = CourseMaterial::factory()->create([
            'course_id' => $course->id
        ]);
        
        $this->assertInstanceOf(Course::class, $material->course);
        $this->assertEquals($course->id, $material->course->id);
    }
    
    /** @test */
    public function it_can_determine_material_type()
    {
        $videoMaterial = CourseMaterial::factory()->video()->create();
        $documentMaterial = CourseMaterial::factory()->document()->create();
        $quizMaterial = CourseMaterial::factory()->quiz()->create();
        
        $this->assertTrue($videoMaterial->isVideo());
        $this->assertTrue($documentMaterial->isDocument());
        $this->assertTrue($quizMaterial->isQuiz());
        
        $this->assertFalse($videoMaterial->isDocument());
        $this->assertFalse($documentMaterial->isQuiz());
        $this->assertFalse($quizMaterial->isVideo());
    }
    
    /** @test */
    public function it_has_correct_type_scopes()
    {
        CourseMaterial::factory()->video()->create();
        CourseMaterial::factory()->document()->create();
        CourseMaterial::factory()->quiz()->create();
        
        $this->assertCount(1, CourseMaterial::videos()->get());
        $this->assertCount(1, CourseMaterial::documents()->get());
        $this->assertCount(1, CourseMaterial::quizzes()->get());
    }
    
    /** @test */
    public function it_orders_by_order_attribute()
    {
        CourseMaterial::factory()->create(['order' => 3]);
        CourseMaterial::factory()->create(['order' => 1]);
        CourseMaterial::factory()->create(['order' => 2]);
        
        $materials = CourseMaterial::ordered()->get();
        
        $this->assertEquals(1, $materials[0]->order);
        $this->assertEquals(2, $materials[1]->order);
        $this->assertEquals(3, $materials[2]->order);
    }
} 