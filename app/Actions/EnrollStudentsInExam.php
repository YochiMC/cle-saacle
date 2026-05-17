<?php

namespace App\Actions;

use App\Models\Exam;
use Illuminate\Support\Facades\DB;

/**
 * Action: Inscribir alumnos en un examen académico.
 *
 * Responsabilidad única: encapsular la lógica transaccional de inscripción al examen,
 * incluyendo la generación del JSON inicial de unidades desde el Enum ExamType
 * y la protección contra duplicados en la tabla pivot.
 *
 * Extraída de ExamController::enroll() sin modificar ninguna lógica funcional.
 */
class EnrollStudentsInExam
{
    /**
     * Inscribe un conjunto de alumnos en el examen dado.
     *
     * Lógica de negocio preservada al 100%:
     * - Obtiene el schema inicial desde el Enum del tipo de examen.
     * - Verifica la existencia previa en el pivot antes de hacer attach (evita duplicados).
     * - Inicializa units_breakdown en JSON y final_average en 0.
     *
     * @param Exam  $exam       El examen al que se inscriben los alumnos.
     * @param array $studentIds Array de IDs de alumnos a inscribir.
     */
    public function execute(Exam $exam, array $studentIds): void
    {
        $defaultBreakdown = $exam->exam_type->defaultUnitsBreakdown();

        DB::transaction(function () use ($exam, $studentIds, $defaultBreakdown) {
            // Lock the exam row to ensure capacity checks are reliable under concurrency
            $lockedExam = \App\Models\Exam::where('id', $exam->id)->lockForUpdate()->first();
            $current = $lockedExam->students()->count();
            $toAdd = count($studentIds);

            if (($lockedExam->capacity ?? 0) < ($current + $toAdd)) {
                throw new \App\Exceptions\ExamCapacityExceededException('Exam capacity exceeded');
            }

            foreach ($studentIds as $studentId) {
                if (!$exam->students()->where('students.id', $studentId)->exists()) {
                    $exam->students()->attach($studentId, [
                        'units_breakdown' => $defaultBreakdown,
                        'final_average'   => 0,
                        'attempt'         => \App\Enums\AttemptEnum::FIRST->value,
                    ]);
                }
            }
        });
    }
}
