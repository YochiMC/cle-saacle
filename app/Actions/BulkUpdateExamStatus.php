<?php

namespace App\Actions;

use App\Models\Exam;
use Illuminate\Support\Facades\DB;

/**
 * Clase de acción para actualizar masivamente el estatus de múltiples exámenes académicos.
 */
class BulkUpdateExamStatus
{
    /**
     * Ejecuta la actualización masiva de estados.
     *
     * @param array<int> $examIds Lista de IDs de los exámenes a actualizar.
     * @param string $status El nuevo estatus a aplicar.
     * @return int Número de registros afectados.
     */
    public function execute(array $examIds, string $status): int
    {
        $uniqueIds = array_values(array_unique($examIds));

        return DB::transaction(function () use ($uniqueIds, $status) {
            $exams = Exam::whereIn('id', $uniqueIds)->get();

            $updatedCount = 0;
            foreach ($exams as $exam) {
                if ((string) $exam->status === $status) {
                    continue;
                }

                $exam->status = $status;
                $exam->save();
                $updatedCount++;
            }

            return $updatedCount;
        });
    }
}
