<?php

namespace App\Actions;

use App\Models\Group;
use App\Models\Qualification;

/**
 * Clase de acción para dar de baja masivamente a alumnos de un grupo académico.
 *
 * Esta acción elimina los registros de la tabla de calificaciones (proceso de baja)
 * asociados a los alumnos seleccionados en un grupo específico.
 */
class BulkUnenrollStudentsFromGroup
{
    /**
     * Ejecuta la baja masiva de alumnos.
     *
     * @param Group $group El grupo del cual se darán de baja los alumnos.
     * @param array<int> $studentIds Lista de IDs de los alumnos a desvincular.
     * @return int Número de registros eliminados.
     */
    public function execute(Group $group, array $studentIds): void
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($group, $studentIds) {
            // 1. Eliminar los registros de calificación
            Qualification::where('group_id', $group->id)
                ->whereIn('student_id', $studentIds)
                ->delete();

            // 2. Detach masivo de la relación BelongsToMany
            $group->students()->detach($studentIds);

            // 3. Resetear estatus de los alumnos a ELIGIBLE_FOR_ENROLLMENT
            \App\Models\Student::whereIn('id', $studentIds)
                ->update(['status' => \App\Enums\StudentStatus::ELIGIBLE_FOR_ENROLLMENT->value]);
        });
    }
}
