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
    public function execute(?string $statusFilter = null): Collection
    {
        $query = Student::with([
            'exams.period',
            'qualifications.group.level',
            'qualifications.group.period',
        ]);

        if ($statusFilter) {
            $query->where('status', $statusFilter);
        } else {
            $query->whereIn('status', [
                StudentStatus::IN_REVIEW,
                StudentStatus::ACCREDITED,
                StudentStatus::RELEASED,
                StudentStatus::SUSPENDED,
            ]);
        }

        return $query->get();
    }
}
