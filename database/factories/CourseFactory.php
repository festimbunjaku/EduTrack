<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'status' => 'published',
            'start_date' => $this->faker->dateTimeBetween('-1 month', '+1 month'),
            'end_date' => $this->faker->dateTimeBetween('+2 months', '+6 months'),
            'enrollment_limit' => $this->faker->numberBetween(10, 30),
            'price' => $this->faker->randomFloat(2, 0, 199.99),
            'difficulty_level' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced']),
            'featured' => $this->faker->boolean(20),
            'cover_image' => 'courses/default-cover.jpg',
            'teacher_id' => User::factory()->state(['email' => 'teacher@example.com']),
        ];
    }

    public function published(): self
    {
        return $this->state(function () {
            return [
                'status' => 'published',
            ];
        });
    }

    public function draft(): self
    {
        return $this->state(function () {
            return [
                'status' => 'draft',
            ];
        });
    }

    public function archived(): self
    {
        return $this->state(function () {
            return [
                'status' => 'archived',
            ];
        });
    }

    public function featured(): self
    {
        return $this->state(function () {
            return [
                'featured' => true,
            ];
        });
    }
} 