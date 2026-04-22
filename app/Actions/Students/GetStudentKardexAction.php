<?php

namespace App\Actions\Students;

use App\Models\Student;

class GetStudentKardexAction
{
    /**
     * Muestra el Kardex de calificaciones (Grupos y Exámenes) de un estudiante.
     *
     * @param Student $student
     * @return array
     */
    public function execute(Student $student): array
    {
        $studentInfo = [
            'name' => $student->full_name,
            'controlNumber' => $student->num_control,
            'career' => $student->degree->name ?? 'N/A',
        ];

        // 1. Obtener Cursos del alumno
        $cursos = $student->qualifications()
            ->with(['group.level', 'group.period'])
            ->get()
            ->map(function ($qualification) use ($student) {
                $group = $qualification->group;
                $nivel = $group?->level?->level_tecnm ?? 'N/A';
                $modalidad = $group?->type?->value ?? 'Curso Normal';

                $row = [
                    'id' => $qualification->student_id,
                    'full_name' => $student->full_name,
                    'matricula' => $student->num_control,
                    'gender' => $student->gender,
                    'semester' => $student->semester,
                    'qualification_id' => $qualification->id,
                    'is_left' => (bool) ($qualification->is_left ?? false),
                ];

                foreach ($this->normalizeBreakdown($qualification->units_breakdown ?? []) as $key => $value) {
                    $row[$key] = $value;
                }

                $row['final_average'] = $qualification->final_average;
                $calificacion = $this->lastMeaningfulValue($row);

                $sortKey = $this->levelSortKey($nivel);

                return [
                    'sort_group' => $sortKey,
                    'sort_exam' => 0,
                    'nivel' => $nivel,
                    'grupo' => $group?->name ?? 'N/A',
                    'materia' => $nivel . ' - ' . $modalidad,
                    'calificacion' => $calificacion ?? 'NA',
                    'resultado' => is_numeric($calificacion) && $calificacion >= 70 ? 'Acreditado' : 'No Acreditado',
                    'periodo' => $group?->period?->name ?? 'N/A',
                    'modalidad' => 'Curso',
                ];
            });

        // 2. Obtener Exámenes
        $examenes = $student->exams()
            ->withPivot('calificacion', 'units_breakdown', 'final_average')
            ->with('period')
            ->get()
            ->map(function ($exam) use ($student) {
                $row = [
                    'id' => $exam->pivot->student_id ?? $exam->id,
                    'full_name' => $student->full_name,
                    'matricula' => $student->num_control,
                    'gender' => $student->gender,
                    'semester' => $student->semester,
                    'exam_student_id' => $exam->pivot->id ?? null,
                    'final_average' => $exam->pivot->final_average,
                ];

                foreach ($this->normalizeBreakdown($exam->pivot->units_breakdown ?? []) as $key => $value) {
                    $row[$key] = $value;
                }

                $calificacionFinal = $this->lastMeaningfulValue($row);
                $grade = $calificacionFinal;
                $gradeStr = strtolower(trim((string) $grade));
                $resultado = (is_numeric($grade) && $grade >= 70) || in_array($gradeStr, ['a', 'acreditado', 'aprobado'], true)
                    ? 'Acreditado'
                    : 'No Acreditado';

                return [
                    'sort_group' => 999,
                    'sort_exam' => 1,
                    'nivel' => 'N/A',
                    'grupo' => $exam->name ?? 'N/A',
                    'materia' => 'Examen de ' . $exam->exam_type->value,
                    'calificacion' => $calificacionFinal,
                    'resultado' => $resultado,
                    'periodo' => $exam->period?->name ?? 'N/A',
                    'modalidad' => 'Examen',
                ];
            });

        // 3. Unificar y numerar manteniendo el orden estricto (Cursos primero, Exámenes después)
        $kardexData = $cursos
            ->sortBy(function (array $item) {
                return sprintf(
                    '%03d|%s|%s',
                    $item['sort_group'],
                    mb_strtolower((string) $item['periodo']),
                    mb_strtolower((string) $item['grupo'])
                );
            })
            ->concat($examenes)
            ->values()
            ->map(function (array $item, int $index) {
                return [
                    'no' => $index + 1,
                    'nivel' => $item['nivel'],
                    'grupo' => $item['grupo'],
                    'materia' => $item['materia'],
                    'calificacion' => $item['calificacion'],
                    'periodo' => $item['periodo'],
                    'subject' => $item['materia'],
                    'grade' => $item['calificacion'],
                    'status' => $item['resultado'],
                    'period' => $item['periodo'],
                ];
            })
            ->all();

        return compact('studentInfo', 'kardexData');
    }

    /**
     * Normaliza units_breakdown cuando llega como JSON crudo o arreglo.
     */
    private function normalizeBreakdown(mixed $breakdown): array
    {
        if (is_string($breakdown)) {
            $breakdown = json_decode($breakdown, true);
        }

        return is_array($breakdown) ? $breakdown : [];
    }

    /**
     * Obtiene el último valor útil de una fila, ignorando metadata y contenedores.
     */
    private function lastMeaningfulValue(array $row): mixed
    {
        $ignoredKeys = [
            'id',
            'full_name',
            'matricula',
            'gender',
            'semester',
            'qualification_id',
            'exam_student_id',
            'is_left',
        ];

        $visibleValues = [];

        foreach ($row as $key => $value) {
            if (in_array($key, $ignoredKeys, true) || $key === 'units_breakdown') {
                continue;
            }

            if (is_array($value) || is_object($value)) {
                continue;
            }

            $visibleValues[$key] = $value;
        }

        if ($visibleValues === []) {
            return null;
        }

        return end($visibleValues);
    }

    /**
     * Genera una clave de orden para el nivel visible del grupo.
     */
    private function levelSortKey(?string $levelName): int
    {
        $normalized = mb_strtolower(trim((string) $levelName));

        $base = match (true) {
            str_contains($normalized, 'básico') || str_contains($normalized, 'basico') => 100,
            str_contains($normalized, 'intermedio') => 200,
            str_contains($normalized, 'avanzado') => 300,
            default => 900,
        };

        preg_match('/(\d+)/', $normalized, $matches);
        $number = isset($matches[1]) ? (int) $matches[1] : 0;

        return $base + $number;
    }
}
