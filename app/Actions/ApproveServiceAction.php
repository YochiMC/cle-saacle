<?php

namespace App\Actions;

use App\Models\Service;
use App\Enums\ServiceStatus;
use App\Enums\StudentStatus;
use App\Models\Period;
use Illuminate\Support\Facades\DB;

class ApproveServiceAction
{
    /**
     * Ejecuta la aprobación/rechazo de un Service de forma atómica.
     *
     * @param Service $service
     * @param array $attributes  Atributos validados del request (incluye 'status')
     * @return void
     */
    public function execute(Service $service, array $attributes): void
    {
        DB::transaction(function () use ($service, $attributes): void {
            $service->update($attributes);

            $student = $service->student;
            if (! $student) {
                return;
            }

            if (($attributes['status'] ?? null) === ServiceStatus::APPROVED->value) {
                $student->update(['status' => StudentStatus::ELIGIBLE_FOR_ENROLLMENT->value]);

                $activePeriod = Period::where('is_active', true)->first();
                if ($activePeriod) {
                    $service->update(['period_id' => $activePeriod->id]);
                }
            } elseif (($attributes['status'] ?? null) === ServiceStatus::REJECTED->value) {
                $student->update(['status' => StudentStatus::WAITING->value]);
            }
        });
    }
}
