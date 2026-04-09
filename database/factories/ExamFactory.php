<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Period;
use App\Models\Teacher;
use App\Models\Student;
use App\Enums\ExamType;
use App\Enums\GroupMode;
use App\Enums\AcademicStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Exam>
 */
class ExamFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $codigoAleatorio = 'EXAM-' . $this->faker->unique()->numberBetween(1000, 9999);

        return [
            'name' => $codigoAleatorio,
            'exam_type' => $this->faker->randomElement(ExamType::cases())->value,
            'mode' => $this->faker->randomElement(GroupMode::cases())->value,
            'capacity' => $this->faker->numberBetween(10, 40),
            'start_date' => $this->faker->dateTimeBetween('-30 days', '+30 days')->format('Y-m-d'),
            'end_date' => $this->faker->dateTimeBetween('-30 days', '+30 days')->format('Y-m-d'),
            'application_time' => $this->faker->randomElement([
                '08:00',
                '09:00',
                '10:00',
                '11:00',
                '14:00',
                '15:00',
                '16:00',
                '17:00'
            ]),
            'classroom' => $this->faker->bothify('Aula ?-##'),
            'status' => $this->faker->randomElement(AcademicStatus::cases())->value,
            'period_id' => Period::inRandomOrder()->value('id') ?? Period::factory(),
            'teacher_id' => Teacher::inRandomOrder()->value('id') ?? Teacher::factory(),
        ];
    }

    /**
     * Configurar el examen para asociar estudiantes automáticamente.
     *
     * @return static
     */
    public function withStudents(): static
    {
        return $this->afterCreating(function (Exam $exam) {
            // Obtener estudiantes aleatorios (5-20) y asociarlos con calificación
            $quantityStudents = $this->faker->numberBetween(5, 20);

            // Si no hay suficientes estudiantes en BD, crear algunos
            if (Student::count() < $quantityStudents) {
                Student::factory($quantityStudents)->create();
            }

            // Obtener IDs de estudiantes aleatorios
            $studentIds = Student::inRandomOrder()
                ->take($quantityStudents)
                ->pluck('id');

            // Asociar estudiantes con calificación aleatoria en la tabla pivot
            foreach ($studentIds as $studentId) {
                $exam->students()->attach($studentId, [
                    'calificacion' => $this->faker->optional(0.3)->numberBetween(0, 100), // 30% sin calificación
                ]);
            }
        });
    }
}
