<?php

namespace App\Actions;

use App\Models\Student;
use App\Enums\StudentStatus;

/**
 * Encapsula la lógica para suspender masivamente a un grupo de alumnos.
 */
class BulkSuspendStudents
{
    /**
     * Ejecuta la suspensión masiva.
     *
     * @param array<int> $studentIds
     * @return int Número de registros afectados.
     */
    public function execute(array $studentIds): int
    {
        return Student::whereIn('id', $studentIds)
            ->update(['status' => StudentStatus::SUSPENDED]);
    }
}
