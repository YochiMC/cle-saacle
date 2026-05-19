<?php

namespace Tests\Unit\Services;

use App\Services\GroupNamingService;
use App\Services\ExamNamingService;
use Tests\TestCase;

class NamingServicesTest extends TestCase
{
    /**
     * @dataProvider groupScheduleProvider
     */
    public function test_group_naming_schedule_letter(string $schedule, string $expectedLetter): void
    {
        $service = new GroupNamingService();
        $attributes = [
            'type' => 'programa egresados',
            'schedule' => $schedule,
            'period_id' => null,
            'mode' => 'Presencial',
        ];

        $name = $service->generateName($attributes);
        // PE + 400 + {Letter} + PER + P
        $this->assertEquals("PE400{$expectedLetter}PERP", $name);
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
        // C + {Letter} + PER + P
        $this->assertEquals("C{$expectedLetter}PERP", $name);
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
}
