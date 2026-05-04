<?php

namespace App\Jobs;

use App\Services\AcademicStatusAutoUpdater;
use App\Models\Period;
use App\Models\Qualification;
use App\Models\Student;
use App\Enums\AcademicStatus;
use App\Enums\StudentStatus;

use App\Actions\System\UpdateGroupsStatusAction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RunAcademicStatusAutoUpdater implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * El número de segundos después de los cuales el trabajo único se libera.
     */
    public int $uniqueFor = 60;

    /**
     * Execute the job.
     */
    public function handle(AcademicStatusAutoUpdater $updater): void
    {
        // Antes de ejecutar el orquestador global, revisamos periodos cuya
        // fecha de inscripción (end_date) ya pasó y aplicamos cierres locales.
        $today = now()->startOfDay();

        $expiredPeriods = Period::whereNotNull('end_date')
            ->whereDate('end_date', '<', $today)
            ->get();

        foreach ($expiredPeriods as $period) {
            // Obtener grupos asociados al periodo
            $groups = $period->groups()->get();
            if ($groups->isEmpty()) {
                continue;
            }

            // Determinar tipos de grupo presentes en este periodo
            $groupTypes = $groups->pluck('type')->unique()->values()->all();

            // Forzar cierre: pasar grupos a COMPLETED usando la Action del sistema
            $action = app(UpdateGroupsStatusAction::class);
            $action->execute(AcademicStatus::COMPLETED, $groupTypes);

            // Actualizar el estado de los alumnos que estaban en espera de inscripción
            $groupIds = $groups->pluck('id')->all();
            $studentIds = Qualification::whereIn('group_id', $groupIds)
                ->pluck('student_id')
                ->unique()
                ->values()
                ->all();

            if (! empty($studentIds)) {
                Student::whereIn('id', $studentIds)
                    ->where('status', StudentStatus::ESPERA_INSCRIPCION->value)
                    ->update(['status' => StudentStatus::ESPERA->value]);
            }
        }

        // Finalmente, se inyecta el orquestador global y se ejecuta indicando el origen manual
        $updater->run('manual_settings_update');
    }
}
