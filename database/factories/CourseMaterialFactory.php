<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\CourseMaterial;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseMaterialFactory extends Factory
{
    protected $model = CourseMaterial::class;

    public function definition(): array
    {
        $types = ['video', 'document', 'quiz', 'presentation'];
        $type = $this->faker->randomElement($types);
        
        return [
            'course_id' => Course::factory(),
            'title' => $this->faker->sentence(),
            'type' => $type,
            'content' => $this->faker->paragraphs(3, true),
            'order' => $this->faker->numberBetween(1, 10),
            'file_path' => $type !== 'quiz' ? "materials/{$type}s/" . $this->faker->uuid() . '.pdf' : null,
            'duration_minutes' => $type === 'video' ? $this->faker->numberBetween(5, 60) : null,
        ];
    }
    
    public function video(): self
    {
        return $this->state(function () {
            return [
                'type' => 'video',
                'file_path' => 'materials/videos/' . $this->faker->uuid() . '.mp4',
                'duration_minutes' => $this->faker->numberBetween(5, 60),
            ];
        });
    }
    
    public function document(): self
    {
        return $this->state(function () {
            return [
                'type' => 'document',
                'file_path' => 'materials/documents/' . $this->faker->uuid() . '.pdf',
                'duration_minutes' => null,
            ];
        });
    }
    
    public function quiz(): self
    {
        return $this->state(function () {
            return [
                'type' => 'quiz',
                'file_path' => null,
                'duration_minutes' => $this->faker->numberBetween(10, 30),
            ];
        });
    }
} 