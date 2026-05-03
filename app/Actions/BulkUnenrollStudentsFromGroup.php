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
    public function execute(Group $group, array $studentIds): int
    {
        return Qualification::where('group_id', $group->id)
            ->whereIn('student_id', $studentIds)
            ->delete();
    }
}
