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
            'type' => 'Programa Egresados',
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
            
            // Multiple hours in string (should take first match)
            ['10:30 - 12:00', 'C'],
            ['Lunes 14:15-16:15', 'G'],
            
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
            'type' => 'Programa Egresados',
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
            'type' => 'Programa Egresados',
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
            'type' => 'Programa Egresados',
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
            'type' => 'Programa Egresados',
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
            'type' => 'Programa Egresados',
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
            'type' => 'Programa Egresados',
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

    private function getPeriodCodeStr($period): string
    {
        $date = \Carbon\Carbon::parse($period->start);
        $month = strtoupper(substr($date->locale('es')->isoFormat('MMM'), 0, 3));
        $year  = $date->format('y');
        return "{$month}{$year}";
    }
}
