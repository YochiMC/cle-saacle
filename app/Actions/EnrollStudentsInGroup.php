<?php

namespace App\Actions;

use App\Models\Group;
use App\Models\Qualification;
use Illuminate\Support\Facades\DB;

/**
 * Action: Inscribir alumnos en un grupo académico.
 *
 * Responsabilidad única: encapsular toda la lógica transaccional de inscripción,
 * incluyendo la determinación del schema inicial de unidades y el cálculo del
 * promedio inicial, sin alterar las reglas de negocio del frontend.
 *
 * Extraída de GroupController::enroll() sin modificar ninguna lógica funcional.
 */
class EnrollStudentsInGroup
{
    /**
     * Inscribe un conjunto de alumnos en el grupo dado.
     *
     * Lógica de negocio preservada al 100%:
     * - Si ya existe una Qualification en el grupo, hereda su schema de unidades.
     * - Si no, genera el schema por defecto desde el Enum del tipo de grupo.
     * - El promedio inicial aplica la regla isFailing: si alguna unidad < 70, el promedio es 'NA'.
     *
     * @param Group $group      El grupo al que se inscriben los alumnos.
     * @param array $studentIds Array de IDs de alumnos a inscribir.
     */
    public function execute(Group $group, array $studentIds): void
    {
        $existingQualification = $group->qualifications()->first();
        $existingUnitsBreakdown = $existingQualification?->units_breakdown ?? [];

        $enumDefaults = $group->type->defaultUnitsBreakdown($group->evaluable_units ?? 0);

        $defaultUnitsBreakdown = !empty($existingUnitsBreakdown)
            ? collect($existingUnitsBreakdown)->map(function ($v, $k) use ($enumDefaults) {
                return $enumDefaults[$k] ?? (is_numeric($v) ? 0 : '-');
            })->toArray()
            : $enumDefaults;

        $initialAverage = 0;
        $numericValues = [];

        foreach ($defaultUnitsBreakdown as $key => $v) {
            if ($key !== 'hizo_certificacion' && is_numeric($v)) {
                $numericValues[] = (float) $v;
            }
        }

        if (!empty($numericValues)) {
            $isFailing = collect($numericValues)->contains(function ($val) {
                return $val < 70;
            });
            $initialAverage = $isFailing ? 'NA' : round(array_sum($numericValues) / count($numericValues));
        }

        DB::transaction(function () use ($group, $studentIds, $defaultUnitsBreakdown, $initialAverage) {
            // Lock the group row to prevent concurrent seat allocation
            $lockedGroup = \App\Models\Group::where('id', $group->id)->lockForUpdate()->first();
            $current = $lockedGroup->qualifications()->count();
            $toAdd = count($studentIds);

            if (($lockedGroup->capacity ?? 0) < ($current + $toAdd)) {
                throw new \App\Exceptions\GroupCapacityExceededException('Group capacity exceeded');
            }

            foreach ($studentIds as $studentId) {
                Qualification::create([
                    'group_id'        => $group->id,
                    'student_id'      => $studentId,
                    'units_breakdown' => $defaultUnitsBreakdown,
                    'final_average'   => $initialAverage,
                    'is_left'         => false,
                    'attempt'         => \App\Enums\AttemptEnum::FIRST->value,
                ]);
            }
        });
    }
}
