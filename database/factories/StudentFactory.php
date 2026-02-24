<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Degree;
use App\Models\TypeStudent;
use App\Models\Level;

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
            //
            'firstName' => $this->faker->firstName(),
            'lastName' => $this->faker->lastName() . ' ' . $this->faker->lastName(),
            'numControl' => $this->faker->unique()->numerify('########'),
            'gender' => $this->faker->randomElement(['M', 'F']),
            'birthDate' => $this->faker->dateTimeBetween('-25 years', '-18 years')->format('Y-m-d'),
            'semester' => $this->faker->numberBetween(1, 13),
            'degree_id' => Degree::inRandomOrder()->value('id') ?? 1,
            'type_student_id' => TypeStudent::inRandomOrder()->value('id') ?? 1,
            'level_id' => Level::inRandomOrder()->value('id') ?? 1,
        ];
    }
}
