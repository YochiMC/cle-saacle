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
     * @return array Estructura de retorno del método detach de Laravel.
     */
    public function execute(Exam $exam, array $studentIds): array
    {
        return $exam->students()->detach($studentIds);
    }
}
