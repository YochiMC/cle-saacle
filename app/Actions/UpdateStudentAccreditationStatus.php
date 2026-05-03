<?php

namespace App\Actions;

use App\Models\Student;
use App\Enums\StudentStatus;

/**
 * Encapsula la lógica para actualizar el estatus académico de un alumno.
 */
class UpdateStudentAccreditationStatus
{
    /**
     * Ejecuta la actualización del estatus.
     *
     * @param Student $student
     * @param string|StudentStatus $status
     * @return bool
     */
    public function execute(Student $student, string|StudentStatus $status): bool
    {
        return $student->update([
            'status' => $status
        ]);
    }
}
