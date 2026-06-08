<?php

namespace Tests\Unit\Services;

use App\Services\GroupNamingService;
use App\Services\ExamNamingService;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class NamingServicesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @dataProvider groupScheduleProvider
     */
    public function test_group_naming_schedule_letter(string $schedule, string $expectedLetter): void
    {
        $service = new GroupNamingService();
        $attributes = [
            'type' => 'Programa Especial',
            'schedule' => $schedule,
            'period_id' => null,
            'mode' => 'Presencial',
        ];

        $name = $service->generateName($attributes);
        // PE + 001 + {Letter} + _ + PER + P
        $this->assertEquals("PE001{$expectedLetter}_PERP", $name);
    }

    public static function groupScheduleProvider(): array
    {
        return [
            // Exact hours in range
            ['08:00', 'A'],
            ['09:00', 'B'],
            ['12:00', 'E'],
            ['20:00', 'M'],

            // Non-exact hours in range (should truncate minutes)
            ['08:30', 'A'],
            ['08:59', 'A'],
            ['09:15', 'B'],
            ['12:45', 'E'],
            ['20:30', 'M'],

            // Format variants (single digit hour)
            ['8:00', 'A'],
            ['8:30', 'A'],

            // Multiple hours in string (should collect only start times)
            ['10:30 - 12:00', 'C'],
            ['Lunes 14:15-16:15', 'G'],
            ['Lunes y Jueves 8:30-10:30 y Viernes 10:30-12:00', 'AC'],
            ['Sábados de 09:00 a 14:00', 'B'],
            ['Lunes 8:00-10:00 y Miércoles 8:00-10:00', 'A'],

            // Out of range hours
            ['07:59', 'Z'],
            ['07:00', 'Z'],
            ['21:00', 'Z'],
            ['21:30', 'Z'],

            // Invalid / Empty
            ['not a time', 'Z'],
            ['', 'Z'],
        ];
    }

    public function test_group_naming_collects_unique_letters_for_mixed_schedule(): void
    {
        $service = new GroupNamingService();

        $attributes = [
            'type' => 'Programa Especial',
            'schedule' => 'Lunes y Jueves 8:30-10:30 y Viernes 10:30-12:00',
            'period_id' => null,
            'mode' => 'Presencial',
        ];

        $name = $service->generateName($attributes);

        $this->assertSame('PE001AC_PERP', $name);
    }

    public function test_group_naming_returns_single_letter_for_simple_spanish_range(): void
    {
        $service = new GroupNamingService();

        $attributes = [
            'type' => 'Programa Especial',
            'schedule' => 'Sábados de 09:00 a 14:00',
            'period_id' => null,
            'mode' => 'Presencial',
        ];

        $name = $service->generateName($attributes);

        $this->assertSame('PE001B_PERP', $name);
    }

    public function test_group_naming_deduplicates_and_sorts_letters(): void
    {
        $service = new GroupNamingService();

        $attributes = [
            'type' => 'Programa Especial',
            'schedule' => 'Lunes 8:00-10:00 y Miércoles 8:00-10:00',
            'period_id' => null,
            'mode' => 'Presencial',
        ];

        $name = $service->generateName($attributes);

        $this->assertSame('PE001A_PERP', $name);
    }

    /**
     * @dataProvider examScheduleProvider
     */
    public function test_exam_naming_schedule_letter(string $time, string $expectedLetter): void
    {
        $service = new ExamNamingService();
        $attributes = [
            'exam_type' => 'convalidación',
            'application_time' => $time,
            'period_id' => null,
            'mode' => 'Presencial',
        ];

        $name = $service->generateName($attributes);
        // C + {Letter} + _ + PER + P
        $this->assertEquals("C{$expectedLetter}_PERP", $name);
    }

    public static function examScheduleProvider(): array
    {
        return [
            // Exact hours in range
            ['08:00', 'A'],
            ['09:00', 'B'],
            ['12:00', 'E'],
            ['20:00', 'M'],

            // Non-exact hours in range (should truncate minutes)
            ['08:30', 'A'],
            ['08:59', 'A'],
            ['09:15', 'B'],
            ['12:45', 'E'],
            ['20:30', 'M'],

            // Seconds suffix (should truncate to hour)
            ['08:30:00', 'A'],
            ['20:00:00', 'M'],

            // Format variants (single digit hour)
            ['8:00', 'A'],
            ['8:30', 'A'],

            // Out of range hours
            ['07:59', 'Z'],
            ['07:00', 'Z'],
            ['21:00', 'Z'],
            ['21:30', 'Z'],

            // Invalid / Empty
            ['not a time', 'Z'],
            ['', 'Z'],
        ];
    }

    public function test_sequential_counter_for_graduate_groups_in_same_period(): void
    {
        // 1. Crear periodo
        $period = \App\Models\Period::factory()->create();

        // 2. Resolver el service
        $service = app(GroupNamingService::class);

        // 3. Generar nombres secuencialmente
        $attributes1 = [
            'type' => 'Programa Especial',
            'schedule' => '08:00',
            'period_id' => $period->id,
            'mode' => 'Presencial',
        ];
        $name1 = $service->generateName($attributes1);
        $this->assertEquals("PE001A_{$this->getPeriodCodeStr($period)}P", $name1);

        // Creamos el primer grupo para que persista en BD
        \App\Models\Group::create(array_merge($attributes1, [
            'name' => $name1,
            'capacity' => 20,
            'status' => \App\Enums\AcademicStatus::ACTIVE,
            'level_id' => \App\Models\Level::factory()->create()->id,
            'teacher_id' => \App\Models\Teacher::factory()->create()->id,
        ]));

        $attributes2 = [
            'type' => 'Programa Especial',
            'schedule' => '09:00',
            'period_id' => $period->id,
            'mode' => 'Virtual',
        ];
        $name2 = $service->generateName($attributes2);
        $this->assertEquals("PE002B_{$this->getPeriodCodeStr($period)}V", $name2);

        // Creamos el segundo grupo en BD
        \App\Models\Group::create(array_merge($attributes2, [
            'name' => $name2,
            'capacity' => 20,
            'status' => \App\Enums\AcademicStatus::ACTIVE,
            'level_id' => \App\Models\Level::factory()->create()->id,
            'teacher_id' => \App\Models\Teacher::factory()->create()->id,
        ]));

        $attributes3 = [
            'type' => 'Programa Especial',
            'schedule' => '10:00',
            'period_id' => $period->id,
            'mode' => 'Híbrido',
        ];
        $name3 = $service->generateName($attributes3);
        $this->assertEquals("PE003C_{$this->getPeriodCodeStr($period)}H", $name3);
    }

    public function test_counter_resets_for_different_period(): void
    {
        $period1 = \App\Models\Period::factory()->create(['start' => '2026-01-01']);
        $period2 = \App\Models\Period::factory()->create(['start' => '2026-06-01']);

        $service = app(GroupNamingService::class);

        // Grupo 1 en Periodo 1
        $attr1 = [
            'type' => 'Programa Especial',
            'schedule' => '08:00',
            'period_id' => $period1->id,
            'mode' => 'Presencial',
        ];
        $name1 = $service->generateName($attr1);
        $this->assertEquals("PE001A_{$this->getPeriodCodeStr($period1)}P", $name1);
        \App\Models\Group::create(array_merge($attr1, [
            'name' => $name1,
            'capacity' => 20,
            'status' => \App\Enums\AcademicStatus::ACTIVE,
            'level_id' => \App\Models\Level::factory()->create()->id,
            'teacher_id' => \App\Models\Teacher::factory()->create()->id,
        ]));

        // Grupo 2 en Periodo 2 (debe reiniciar a 001)
        $attr2 = [
            'type' => 'Programa Especial',
            'schedule' => '08:00',
            'period_id' => $period2->id,
            'mode' => 'Presencial',
        ];
        $name2 = $service->generateName($attr2);
        $this->assertEquals("PE001A_{$this->getPeriodCodeStr($period2)}P", $name2);
    }

    public function test_counter_preservation_on_update_same_period(): void
    {
        $period = \App\Models\Period::factory()->create();
        $service = app(GroupNamingService::class);

        // Crear primer grupo
        $attributes = [
            'type' => 'Programa Especial',
            'schedule' => '08:00',
            'period_id' => $period->id,
            'mode' => 'Presencial',
        ];
        $name = $service->generateName($attributes);
        $group = \App\Models\Group::create(array_merge($attributes, [
            'name' => $name,
            'capacity' => 20,
            'status' => \App\Enums\AcademicStatus::ACTIVE,
            'level_id' => \App\Models\Level::factory()->create()->id,
            'teacher_id' => \App\Models\Teacher::factory()->create()->id,
        ]));

        $this->assertEquals("PE001A_{$this->getPeriodCodeStr($period)}P", $group->name);

        // Simular actualización del horario en el mismo periodo
        $updateAttributes = array_merge($group->toArray(), [
            'schedule' => '09:00', // cambia de 8:00 (A) a 9:00 (B)
        ]);

        $updatedName = $service->generateName($updateAttributes);
        // Debe mantener el '001' del contador original, pero cambiar la letra a 'B'
        $this->assertEquals("PE001B_{$this->getPeriodCodeStr($period)}P", $updatedName);
    }

    public function test_group_naming_collision_resolution_starts_at_two(): void
    {
        $period = \App\Models\Period::factory()->create();
        $level = \App\Models\Level::factory()->create(['level_tecnm' => 'Básico 1 - unique - ' . uniqid()]);
        $teacher = \App\Models\Teacher::factory()->create();

        $service = app(GroupNamingService::class);

        $attributes1 = [
            'type' => 'Regular',
            'level_id' => $level->id,
            'schedule' => '08:00',
            'period_id' => $period->id,
            'mode' => 'Presencial',
        ];

        // Generamos el primer nombre (base)
        $name1 = $service->generateName($attributes1);
        $expectedBase = "RB100A_{$this->getPeriodCodeStr($period)}P";
        $this->assertEquals($expectedBase, $name1);

        // Insertamos el primer grupo en la base de datos
        $group1 = \App\Models\Group::create(array_merge($attributes1, [
            'name' => $name1,
            'capacity' => 20,
            'status' => \App\Enums\AcademicStatus::ACTIVE,
            'teacher_id' => $teacher->id,
        ]));

        // Ahora intentamos generar el nombre para un segundo grupo con los mismos atributos
        $name2 = $service->generateName($attributes1);
        $this->assertEquals("RB100A2_{$this->getPeriodCodeStr($period)}P", $name2);

        // Creamos el segundo grupo en BD
        $group2 = \App\Models\Group::create(array_merge($attributes1, [
            'name' => $name2,
            'capacity' => 20,
            'status' => \App\Enums\AcademicStatus::ACTIVE,
            'teacher_id' => $teacher->id,
        ]));

        // Ahora el tercer grupo
        $name3 = $service->generateName($attributes1);
        $this->assertEquals("RB100A3_{$this->getPeriodCodeStr($period)}P", $name3);

        // Verificamos que si actualizamos el primer grupo conservando sus atributos (incluyendo su ID), no colisione
        $updateAttrs1 = array_merge($attributes1, ['id' => $group1->id]);
        $name1Updated = $service->generateName($updateAttrs1);
        $this->assertEquals($name1, $name1Updated);

        // Verificamos que si actualizamos el segundo grupo, mantenga su número 2
        $updateAttrs2 = array_merge($attributes1, ['id' => $group2->id]);
        $name2Updated = $service->generateName($updateAttrs2);
        $this->assertEquals($name2, $name2Updated);
    }

    private function getPeriodCodeStr($period): string
    {
        $date = \Carbon\Carbon::parse($period->start);
        $month = strtoupper(substr($date->locale('es')->isoFormat('MMM'), 0, 3));
        $year  = $date->format('y');
        return "{$month}{$year}";
    }
}
