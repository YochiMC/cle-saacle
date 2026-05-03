<?php

namespace App\Actions\Students;

use App\Enums\StudentStatus;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\DB;

/**
 * Action: ResetStudentsStatusAction
 *
 * Se encarga de actualizar el estado de una colección de alumnos (vía relación)
 * al estado de "En Espera" (WAITING) de forma masiva para optimizar el rendimiento.
 */
class ResetStudentsStatusAction
{
    /**
     * Ejecuta la actualización masiva de estados.
     *
     * @param Relation $relation Relación de Eloquent que vincula a los estudiantes.
     * @return void
     */
    public function execute(Relation $relation): void
    {
        // Extraemos los IDs de los alumnos de la relación.
        // Usamos el prefijo de tabla para evitar ambigüedad en Joins.
        $studentIds = $relation->pluck('students.id');

        if ($studentIds->isNotEmpty()) {
            DB::transaction(function () use ($studentIds): void {
                // Hacemos el update masivo directo al modelo Student, no a la tabla pivote.
                \App\Models\Student::whereIn('id', $studentIds)
                    ->update(['status' => StudentStatus::WAITING->value]);
            });
        }
    }
}
