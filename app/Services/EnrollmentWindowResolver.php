<?php

namespace App\Services;

use App\Models\Period;
use Carbon\Carbon;

class EnrollmentWindowResolver
{
    /**
     * Resuelve el periodo activo que cubre la fecha actual.
     */
    public function resolveActivePeriod(): ?Period
    {
        return app(PeriodActivationService::class)->syncForDate(now());
    }

    /**
     * Determina si el periodo recibido está abierto para inscripción.
     */
    public function isOpen(?Period $period): bool
    {
        if (! $period || ! $period->start_date || ! $period->end_date) {
            return false;
        }

        $start = Carbon::parse($period->start_date)->startOfDay();
        $end = Carbon::parse($period->end_date)->endOfDay();

        return now()->between($start, $end);
    }
}