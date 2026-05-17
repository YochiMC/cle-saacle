<?php

namespace App\Actions\Students;

use App\Models\Group;
use App\Models\Student;
use App\Models\Qualification;
use App\Enums\StudentStatus;
use Illuminate\Support\Facades\DB;

/**
 * Acción: UnenrollStudentAction
 * 
 * Orquesta la baja de un alumno de un grupo académico, garantizando
 * que no queden registros huérfanos en la tabla de calificaciones.
 */
class UnenrollStudentAction
{
    /**
     * Ejecuta el proceso de baja del alumno.
     *
     * @param Student $student
     * @param Group $group
     * @return void
     */
    public function execute(Student $student, Group $group): void
    {
        DB::transaction(function () use ($student, $group) {
            // 1. Eliminar físicamente el registro de calificación (modelo Qualification)
            // Esto dispara Observers de Qualification si existieran.
            Qualification::where('student_id', $student->id)
                ->where('group_id', $group->id)
                ->delete();

            // 2. Romper la relación en la tabla pivote (en este caso es la misma tabla qualifications)
            // Se realiza por seguridad para asegurar la limpieza total de la relación BelongsToMany.
            $group->students()->detach($student->id);

            // 3. Restaurar el estado del alumno a ELIGIBLE_FOR_ENROLLMENT
            // Esto permite que el alumno sea elegible para reinscripción en el mismo nivel/periodo.
            $student->update(['status' => StudentStatus::ELIGIBLE_FOR_ENROLLMENT->value]);
        });
    }
}
