<?php

namespace Database\Factories;

use App\Models\User;
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
            'user_id' => User::factory(),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName() . ' ' . $this->faker->lastName(),
            'category' => $this->faker->randomElement(['A', 'B', 'C']),
            'level' => $this->faker->randomElement(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
            'rfc' => $this->faker->unique()->regexify('[A-Z]{4}[0-9]{6}[A-Z0-9]{3}'),
            'curp' => $this->faker->unique()->regexify('[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9]{2}'),
            'bank_name' => $this->faker->randomElement(['BBVA', 'Santander', 'Banamex', 'Banorte']),
            'clabe' => $this->faker->numerify('##################'),
            'ttc_hours' => $this->faker->numberBetween(10, 40),
            'grade' => $this->faker->randomElement(['Licenciatura', 'Maestría', 'Doctorado']),
            'is_native' => $this->faker->boolean(),
        ];
    }

    public function withRole(): static
{
    return $this->afterCreating(function (\App\Models\Teacher $teacher) {
        // Asignamos el rol al USUARIO asociado al profesor
        $teacher->user->assignRole('teacher'); 
    });
}
}
