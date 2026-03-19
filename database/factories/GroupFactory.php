<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Period;
use App\Models\Level;
use App\Models\Teacher;
use App\Enums\GroupStatus;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Group>
 */
class GroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $codigoAleatorio = 'GRP-' . $this->faker->unique()->numberBetween(1000, 9999);
        return [
            'name' => $codigoAleatorio,
            'mode' => $this->faker->randomElement(['Presencial', 'Virtual', 'Híbrido']),
            'type' => $this->faker->randomElement(['Regular', 'Intensivo']),
            'capacity' => $this->faker->numberBetween(15, 35),
            'schedule' => $this->faker->randomElement([
                'Lunes y Miércoles 16:00 - 18:00',
                'Martes y Jueves 10:00 - 12:00',
                'Sábados 08:00 - 13:00',
                'Viernes 14:00 - 18:00'
            ]),
            'classroom' => $this->faker->bothify('Aula ?-##'), // Ej: Aula A-12
            // meeting_link tiene un 30% de probabilidad de tener una URL (para los de línea/híbrido)
            'meeting_link' => $this->faker->optional(0.3)->url(),

            // --- LLAVES FORÁNEAS MAGISTRALES ---
            // Esto busca un ID aleatorio que ya exista en tu BD.
            // Si la tabla está vacía, crea uno nuevo al vuelo llamando a su propio Factory.
            'period_id' => Period::inRandomOrder()->value('id') ?? Period::factory(),
            'level_id' => Level::inRandomOrder()->value('id') ?? Level::factory(),
            'status' => $this->faker->randomElement(GroupStatus::cases())->value,

            // Asumiendo que tus docentes son Usuarios con el rol 'teacher' de Spatie
            // Si tienes una tabla separada llamada 'teachers', cámbialo a Teacher::inRandomOrder()...
            'teacher_id' => Teacher::inRandomOrder()->value('id') ?? Teacher::factory(),
        ];
    }
}
