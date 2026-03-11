<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Period>
 */
class PeriodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 1. Generamos una fecha de inicio aleatoria entre el año pasado y el próximo
        $startDate = $this->faker->dateTimeBetween('-1 years', '+1 years');

        // 2. Clonamos la fecha y le sumamos entre 4 y 6 meses para la fecha de fin
        $endDate = (clone $startDate)->modify('+' . $this->faker->numberBetween(4, 6) . ' months');

        // 3. Armamos un nombre realista (Ej: "Enero - Junio 2026")
        $nombresPeriodo = ['Enero - Junio', 'Agosto - Diciembre', 'Verano Intensivo'];

        return [
            'name' => $this->faker->randomElement($nombresPeriodo) . ' ' . $startDate->format('Y'),
            'start' => $startDate->format('Y-m-d'),
            'end' => $endDate->format('Y-m-d'),
            // Le damos solo un 10% de probabilidad de ser el periodo activo
            'is_active' => $this->faker->boolean(10),
        ];
    }
}
