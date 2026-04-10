<?php

namespace App\Actions;

use App\Models\Group;

/**
 * Action: Actualizar el número de unidades evaluables de un grupo.
 *
 * Responsabilidad única: actualizar el campo `evaluable_units` del grupo
 * y reconciliar el JSON de calificaciones de todos sus alumnos al nuevo schema,
 * recalculando el promedio con la regla isFailing.
 *
 * Extraída de GroupController::updateUnits() sin modificar ninguna lógica funcional.
 * Esta Action CONSOLIDA la lógica isFailing que antes estaba duplicada en
 * GroupController::enroll() y GroupController::updateUnits().
 */
class UpdateGroupEvaluableUnits
{
    /**
     * Actualiza el esquema de unidades del grupo y reconcilia las calificaciones existentes.
     *
     * Lógica de negocio preservada al 100%:
     * - Genera el baseSchema desde el Enum del tipo de grupo con el nuevo número de unidades.
     * - Reconcilia: conserva valores existentes, descarta unidades eliminadas, rellena nuevas con 0.
     * - Recalcula final_average con la regla isFailing (< 70 → 'NA').
     *
     * @param Group $group          El grupo a actualizar.
     * @param int   $evaluableUnits El nuevo número de unidades a evaluar.
     */
    public function execute(Group $group, int $evaluableUnits): void
    {
        $group->update(['evaluable_units' => $evaluableUnits]);

        $baseSchema = $group->type->defaultUnitsBreakdown($evaluableUnits);

        foreach ($group->qualifications as $qualification) {
            $currentBreakdown = $qualification->units_breakdown ?? [];

            $newBreakdown = array_intersect_key(
                array_merge($baseSchema, $currentBreakdown),
                $baseSchema
            );

            $numericValues = [];
            foreach ($newBreakdown as $key => $v) {
                if ($key !== 'hizo_certificacion') {
                    if (is_numeric($v)) {
                        $numericValues[] = (float) $v;
                    } elseif (is_string($v) && $v !== '') {
                        $numericValues[] = (float) $v;
                    }
                }
            }

            if (empty($numericValues)) {
                $finalAverage = 0;
            } else {
                $isFailing = collect($numericValues)->contains(function ($val) {
                    return $val < 70;
                });

                $finalAverage = $isFailing
                    ? 'NA'
                    : round(array_sum($numericValues) / count($numericValues));
            }

            $qualification->update([
                'units_breakdown' => $newBreakdown,
                'final_average'   => $finalAverage,
            ]);
        }
    }
}
