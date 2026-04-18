<?php

namespace App\Services;

use Carbon\Carbon;
use DateTimeInterface;

class PeriodNamingService
{
    public function generate(DateTimeInterface|string $startDate, DateTimeInterface|string $endDate): string
    {
        $start = Carbon::parse($startDate)->locale('es');
        $end = Carbon::parse($endDate)->locale('es');

        return sprintf(
            '%s - %s %s',
            $this->formatMonth($start),
            $this->formatMonth($end),
            $start->year
        );
    }

    private function formatMonth(Carbon $date): string
    {
        return mb_convert_case($date->monthName, MB_CASE_TITLE, 'UTF-8');
    }
}
