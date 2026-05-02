<?php

namespace App\Actions;

use App\Models\Exam;

/**
 * Clase de acción para desmatricular masivamente alumnos de un examen académico.
 *
 * Utiliza la relación pivot de Eloquent para eliminar los registros en
 * la tabla intermedia `exam_student`.
 */
class BulkDetachStudentsFromExam
{
    /**
     * Ejecuta la desvinculación masiva del examen.
     *
     * @param Exam $exam El examen del cual se desvincularán los alumnos.
     * @param array<int> $studentIds Lista de IDs de los alumnos a desmatricular.
     * @return int Número de relaciones eliminadas del pivot.
     */
    public function execute(Exam $exam, array $studentIds): int
    {
        return $exam->students()->detach($studentIds);
    }
}
