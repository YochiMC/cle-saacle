<?php

namespace App\Actions;

use App\Models\Exam;
use Illuminate\Support\Facades\DB;

/**
 * Action: Actualización masiva de calificaciones de examen (tabla pivot exam_student).
 *
 * Responsabilidad única: persistir en una sola transacción atómica el array
 * de calificaciones del examen proveniente de ExamView.
 *
 * Extraída de ExamController::bulkUpdatePivot() sin modificar ninguna lógica funcional.
 */
class BulkUpdateExamQualifications
{
    /**
     * Actualiza masivamente las calificaciones del pivot exam_student.
     *
     * @param Exam  $exam            El examen cuyas calificaciones se actualizan.
     * @param array $qualifications  Array de items con student_id, units_breakdown y final_average.
     */
    public function execute(Exam $exam, array $qualifications): void
    {
        DB::transaction(function () use ($exam, $qualifications) {
            foreach ($qualifications as $q) {
                $exam->students()->updateExistingPivot($q['student_id'], [
                    'units_breakdown' => $q['units_breakdown'],
                    'final_average'   => $q['final_average'] ?? 0,
                ]);
            }
        });
    }
}
