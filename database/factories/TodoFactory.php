<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Todo>
 */
class TodoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'completed' => $this->faker->boolean(20),
            'user_id' => User::factory(),
        ];
    }
    
    /**
     * Indicate that the todo is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed' => true,
        ]);
    }
    
    /**
     * Indicate that the todo is not completed.
     */
    public function incomplete(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed' => false,
        ]);
    }
}
