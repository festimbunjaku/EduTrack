<?php

namespace Database\Factories;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CertificateFactory extends Factory
{
    protected $model = Certificate::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['email' => 'student@example.com']),
            'course_id' => Course::factory(),
            'certificate_number' => 'CERT-' . $this->faker->unique()->randomNumber(6),
            'issued_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'file_path' => 'certificates/' . $this->faker->uuid() . '.pdf',
        ];
    }
} 