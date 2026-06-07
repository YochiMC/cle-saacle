<?php

namespace App\Actions;

use App\Models\Student;
use App\Enums\StudentStatus;
use Illuminate\Database\Eloquent\Collection;

class GetAccreditationCandidates
{
    /**
     * Recupera los alumnos listos para evaluación de acreditación o que ya la tengan.
     */
    public function execute(?string $statusFilter = null, ?string $periodId = null): Collection
    {
        $query = Student::with([
            'exams.period',
            'qualifications.group.level',
            'qualifications.group.period',
        ]);

        // Filtro de Estatus por defecto para cargar todos los candidatos elegibles (el filtrado de estado y periodo es local en React)
        $query->whereIn('students.status', [
            StudentStatus::IN_REVIEW,
            StudentStatus::ACCREDITED,
            StudentStatus::DISABLED,
        ]);

        return $query->get();
    }
}
