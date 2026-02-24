<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Teacher>
 */
class TeacherFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'firstName' => fake()->firstName(),
            'lastName' => fake()->lastName(),
            'rfc' => fake()->regexify('[A-Z]{4}[0-9]{6}[A-Z0-9]{3}'),
            'curp' => fake()->regexify('[A-Z]{4}[0-9]{6}[A-Z0-9]{8}'),
            'bankName' => fake()->company(),
            'clabe' => fake()->numerify('##################'),
            'ttc_hours' => fake()->numberBetween(10, 40),
            'grade' => fake()->randomElement(['Licenciatura', 'Maestría', 'Doctorado']),
            'is_native' => fake()->boolean(),
        ];
    }
}
