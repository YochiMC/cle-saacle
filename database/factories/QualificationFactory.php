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
        $unit1 = $this->faker->numberBetween(0, 100);
        $unit2 = $this->faker->numberBetween(0, 100);
        $average = (int) round(($unit1 + $unit2) / 2);
        
        return [
            'student_id' => Student::factory(),
            'group_id' => Group::factory(),
            'unit_1' => $unit1,
            'unit_2' => $unit2,
            'final_average' => $average,
            'is_approved' => $average >= 70,
            'is_left' => $this->faker->boolean(5), // 5% de probabilidad de haber abandonado
        ];
    }
}
