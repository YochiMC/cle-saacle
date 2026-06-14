<?php

namespace App\Actions;

use App\Models\Group;
use App\Models\Exam;
use App\Models\Student;
use App\Enums\StudentStatus;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class AutoQueueAccreditationCandidates
{
    /**
     * Evalúa a los estudiantes de un grupo recién completado.
     * Criterio: Solo para niveles "Intermedio 5" o "Programa Especial", promedios >= 70, no dados de baja.
     */
    public function executeForGroup(Group $group): void
    {
        $group->loadMissing('level', 'period', 'qualifications.student');

        $levelName = $group->level->level_tecnm ?? '';

        $source = $this->resolveGroupSource($levelName);
        if ($source === null) {
            return;
        }

        $date = $this->resolveAccreditationDateFromPeriod($group->period?->end);

        foreach ($group->qualifications as $qualification) {
            $student = $qualification->student;

            if (!$student || $qualification->is_left) {
                continue;
            }

            \Illuminate\Support\Facades\Log::info('Evaluando alumno en Railway', [
    'student_id' => $student->id,
    'final_average' => $qualification->final_average,
    'is_numeric' => is_numeric($qualification->final_average)
]);

            if (is_numeric($qualification->final_average) && $qualification->final_average >= 70) {
                $this->queueStudent($student, $source, $date);
            }
        }
    }

    /**
     * Evalúa a los estudiantes de un examen recién completado.
     * Criterio: Aplica a todos excepto tipo "Ubicación", promedios >= 70.
     */
    public function executeForExam(Exam $exam): void
    {
        $exam->loadMissing('period', 'students');

        $examType = trim((string) ($exam->exam_type->value ?? $exam->exam_type));
        $normalizedType = Str::of($examType)->lower()->ascii()->toString();

        if (str_contains($normalizedType, 'ubicacion') || str_contains($normalizedType, 'placement')) {
            return;
        }

        $source = Str::of($examType)->title()->toString();
        $date = $this->resolveAccreditationDateFromPeriod($exam->period?->end);

        foreach ($exam->students as $student) {
            $pivot = $student->pivot;
            if ($this->isApprovedExamResult($pivot)) {
                $this->queueStudent($student, $source, $date);
            }
        }
    }

    /**
     * Encola a un estudiante actualizando su estatus si es aplicable.
     * No sobreescribe el estatus si ya está acreditado.
     */
    private function queueStudent(Student $student, string $source, Carbon $date): void
    {
        // Protegemos a los alumnos que ya han sido dictaminados
        if (in_array($student->status, [StudentStatus::ACCREDITED])) {
            return;
        }

        $student->update([
            'status' => StudentStatus::IN_REVIEW,
            'accreditation_source' => $source,
            'accreditation_date' => $date,
        ]);
    }

    private function resolveGroupSource(string $levelName): ?string
    {
        $normalized = Str::of($levelName)->lower()->ascii()->squish()->toString();

        if ($normalized === 'intermedio 5') {
            return 'Cursos regulares';
        }

        if (in_array($normalized, ['programa especial', 'programa de egresados', 'programa egresados', 'curso remedial'])) {
            return 'Programa especial';
        }

        return null;
    }

    private function resolveAccreditationDateFromPeriod(null|string|Carbon $periodEnd): Carbon
    {
        if ($periodEnd instanceof Carbon) {
            return $periodEnd;
        }

        if (is_string($periodEnd) && trim($periodEnd) !== '') {
            return Carbon::parse($periodEnd);
        }

        return now();
    }

    private function isApprovedExamResult(mixed $pivot): bool
    {
        $units = $this->extractUnitsBreakdown($pivot);

        // 1. Caso: Convalidación (verifica nivel MCER priorizando la llave speaking)
        $level = data_get($units, 'speaking') ?? data_get($units, 'certified_level') ?? data_get($units, 'nivel_certificado');
        if ($level) {
            $normalizedLevel = Str::upper(trim((string) $level));
            if (in_array($normalizedLevel, ['B1', 'B2', 'C1', 'C2'], true)) {
                return true;
            }
        }

        // 2. Caso: Examen de 4 habilidades (verifica que las 4 áreas sean >= 70)
        $hasFourSkills = array_key_exists('listening', $units)
            && array_key_exists('reading', $units)
            && array_key_exists('writing', $units)
            && array_key_exists('speaking', $units);

        if ($hasFourSkills) {
            $skills = ['listening', 'reading', 'writing', 'speaking'];
            foreach ($skills as $skill) {
                $val = data_get($units, $skill);
                if (!is_numeric($val) || (float) $val < 70) {
                    return false;
                }
            }
            return true;
        }

        // 3. Fallback: Promedios o calificaciones numéricas generales >= 70 (Planes anteriores, etc.)
        $numericCandidates = [
            $pivot->final_average ?? null,
            $pivot->calificacion ?? null,
            data_get($units, 'calificacion_final'),
            data_get($units, 'promedio'),
            data_get($units, 'promedio_habilidades'),
        ];

        foreach ($numericCandidates as $candidate) {
            if (is_numeric($candidate) && (float) $candidate >= 70) {
                return true;
            }
        }

        return false;
    }

    private function extractUnitsBreakdown(mixed $pivot): array
    {
        $units = $pivot->units_breakdown ?? [];

        if (is_array($units)) {
            return $units;
        }

        if (is_string($units) && trim($units) !== '') {
            $decoded = json_decode($units, true);
            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }
}