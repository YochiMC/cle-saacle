<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory para Level.
 *
 * Produce niveles de idioma con datos realistas para su uso en pruebas.
 * Los seeders reales usan Level::create() directamente, pero los tests
 * necesitan Level::factory() para relaciones en GroupFactory y otros.
 */
class LevelFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $counter = 0;
        $counter++;

        $levels = [
            ['level_tecnm' => 'Básico 1',     'level_mcer' => 'A1',    'hours' => 45, 'program_type' => 'Regular'],
            ['level_tecnm' => 'Básico 2',     'level_mcer' => 'A1',    'hours' => 45, 'program_type' => 'Regular'],
            ['level_tecnm' => 'Básico 3',     'level_mcer' => 'A1',    'hours' => 45, 'program_type' => 'Regular'],
            ['level_tecnm' => 'Intermedio 1', 'level_mcer' => 'B1',    'hours' => 45, 'program_type' => 'Regular'],
            ['level_tecnm' => 'Intermedio 5', 'level_mcer' => 'B1',    'hours' => 45, 'program_type' => 'Regular'],
        ];

        // Rota por los valores reales del catálogo para evitar duplicar level_tecnm
        $pick = $levels[($counter - 1) % count($levels)];

        return [
            'level_tecnm'  => $pick['level_tecnm'] . '-test-' . $counter,
            'level_mcer'   => $pick['level_mcer'],
            'hours'        => $pick['hours'],
            'program_type' => $pick['program_type'],
        ];
    }
}
