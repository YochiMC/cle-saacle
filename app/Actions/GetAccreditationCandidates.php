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
        $statusFilter = request('status') === 'all' || request('status') === '' ? null : request('status');
        $periodId = request('period_id') === 'all' || request('period_id') === '' ? null : request('period_id');

        $query = Student::with([
            'exams.period',
            'qualifications.group.level',
            'qualifications.group.period',
        ]);

        // Filtro de Estatus (Uso de default si no se proporciona filtro)
        $query->when($statusFilter, 
            fn($q, $status) => $q->where('students.status', $status),
            fn($q) => $q->whereIn('students.status', [
                StudentStatus::IN_REVIEW,
                StudentStatus::ACCREDITED,
                StudentStatus::DISABLED,
            ])
        );

        // Filtro de Periodo (Búsqueda exacta en relaciones)
        if ($periodId) {
            $query->where(function ($q) use ($periodId) {
                $q->whereHas('qualifications.group', fn($query) => $query->where('period_id', $periodId))
                  ->orWhereHas('exams', fn($query) => $query->where('period_id', $periodId));
            });
        }

        return $query->get();
    }
}
