<?php

namespace Database\Factories;

use App\Models\Group;
use App\Models\Student;
use App\Models\Qualification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Qualification>
 */
class QualificationFactory extends Factory
{
    /**
     * El nombre del modelo correspondiente al factory.
     *
     * @var string
     */
    protected $model = Qualification::class;

    /**
     * Define el estado por defecto del modelo.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Simula grupos con distinta cantidad de unidades evaluables.
        $unitsCount = 3;
        $unitsBreakdown = [];

        for ($i = 1; $i <= $unitsCount; $i++) {
            $unitsBreakdown["unit_{$i}"] = $this->faker->numberBetween(0, 100);
        }

        $average = (int) round(array_sum($unitsBreakdown) / count($unitsBreakdown));

        return [
            'student_id' => Student::factory(),
            'group_id' => Group::factory(),
            'units_breakdown' => $unitsBreakdown,
            'final_average' => $average,
            'is_approved' => $average >= 70,
            'is_left' => $this->faker->boolean(5), // 5% de probabilidad de haber abandonado
        ];
    }
}
