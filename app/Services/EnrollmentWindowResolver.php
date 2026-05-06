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
        $today = now()->startOfDay();

        return Period::query()
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->orderByDesc('start_date')
            ->first()
            ?? Period::query()->where('is_active', true)->orderByDesc('start_date')->first();
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