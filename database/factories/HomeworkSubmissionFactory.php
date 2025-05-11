<?php

namespace Database\Factories;

use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class HomeworkSubmissionFactory extends Factory
{
    protected $model = HomeworkSubmission::class;

    public function definition(): array
    {
        return [
            'homework_id' => Homework::factory(),
            'user_id' => User::factory()->state(['email' => 'student@example.com']),
            'content' => $this->faker->paragraphs(3, true),
            'file_path' => $this->faker->randomElement([null, 'submissions/' . $this->faker->uuid() . '.pdf']),
            'submitted_at' => $this->faker->dateTimeBetween('-2 weeks', 'now'),
            'status' => $this->faker->randomElement(['submitted', 'graded']),
            'grade' => null,
            'feedback' => null,
        ];
    }
    
    public function graded(): self
    {
        return $this->state(function () {
            $homework = Homework::inRandomOrder()->first() ?? Homework::factory()->create();
            $maxPoints = $homework->max_points;
            
            return [
                'homework_id' => $homework->id,
                'status' => 'graded',
                'grade' => $this->faker->numberBetween(0, $maxPoints),
                'feedback' => $this->faker->paragraph(),
            ];
        });
    }
    
    public function submitted(): self
    {
        return $this->state(function () {
            return [
                'status' => 'submitted',
                'grade' => null,
                'feedback' => null,
            ];
        });
    }
} 