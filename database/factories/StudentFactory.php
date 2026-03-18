<?php

namespace Database\Factories;

use App\Models\Degree;
use App\Models\Level;
use App\Models\TypeStudent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Enums\GroupStatus;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Student>
 */
class StudentFactory extends Factory
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
            'num_control' => $this->faker->unique()->numerify('########'),
            'gender' => $this->faker->randomElement(['M', 'F']),
            'birthdate' => $this->faker->dateTimeBetween('-25 years', '-18 years')->format('Y-m-d'),
            'semester' => $this->faker->numberBetween(1, 13),
            'status' => $this->faker->randomElement(GroupStatus::cases())->value,
            'degree_id' => Degree::inRandomOrder()->value('id') ?? Degree::factory(),
            'type_student_id' => TypeStudent::inRandomOrder()->value('id') ?? TypeStudent::factory(),
            'level_id' => Level::inRandomOrder()->value('id') ?? Level::factory(),
        ];
    }

    public function withRole(): static
    {
        return $this->afterCreating(function (\App\Models\Student $student) {
            // Asignamos el rol al USUARIO asociado al estudiante
            $student->user->assignRole('student');
        });
    }
}
