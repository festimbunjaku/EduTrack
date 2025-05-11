<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EnrollmentFactory extends Factory
{
    protected $model = Enrollment::class;

    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'user_id' => User::factory()->state(['email' => 'student@example.com']),
            'status' => 'active',
            'enrolled_at' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'last_activity_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'completion_percentage' => $this->faker->numberBetween(0, 100),
        ];
    }

    public function active(): self
    {
        return $this->state(function () {
            return [
                'status' => 'active',
            ];
        });
    }

    public function completed(): self
    {
        return $this->state(function () {
            return [
                'status' => 'completed',
                'completion_percentage' => 100,
            ];
        });
    }

    public function withdrawn(): self
    {
        return $this->state(function () {
            return [
                'status' => 'withdrawn',
            ];
        });
    }
} 