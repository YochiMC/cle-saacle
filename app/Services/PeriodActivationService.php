<?php

namespace App\Services;

use App\Models\Period;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PeriodActivationService
{
    /**
     * Sincroniza la bandera is_active usando la fecha indicada.
     *
     * Regla: solo puede existir un periodo activo y debe ser el que cubre la fecha actual.
     */
    public function syncForDate(?Carbon $date = null): ?Period
    {
        $targetDate = ($date ?? now())->copy()->startOfDay();

        $periodToActivate = Period::query()
            ->whereNotNull('start_date')
            ->whereNotNull('end_date')
            ->whereDate('start_date', '<=', $targetDate)
            ->whereDate('end_date', '>=', $targetDate)
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->first();

        DB::transaction(function () use ($periodToActivate): void {
            if (! $periodToActivate) {
                Period::query()->where('is_active', true)->update(['is_active' => false]);

                return;
            }

            Period::query()
                ->where('id', '!=', $periodToActivate->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            if (! $periodToActivate->is_active) {
                $periodToActivate->forceFill(['is_active' => true])->save();
            }
        });

        return $periodToActivate?->fresh();
    }
}