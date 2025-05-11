<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Homework;
use Illuminate\Database\Eloquent\Factories\Factory;

class HomeworkFactory extends Factory
{
    protected $model = Homework::class;

    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraphs(2, true),
            'max_points' => $this->faker->randomElement([10, 20, 25, 50, 100]),
            'due_date' => $this->faker->dateTimeBetween('+1 week', '+4 weeks'),
        ];
    }
    
    public function withPastDueDate(): self
    {
        return $this->state(function () {
            return [
                'due_date' => $this->faker->dateTimeBetween('-1 month', '-1 day'),
            ];
        });
    }
    
    public function withFutureDueDate(): self
    {
        return $this->state(function () {
            return [
                'due_date' => $this->faker->dateTimeBetween('+1 day', '+1 month'),
            ];
        });
    }
} 