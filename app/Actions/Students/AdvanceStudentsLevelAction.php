<?php

namespace App\Actions\Students;

use App\Models\Group;
use App\Models\Exam;
use App\Models\Level;
use App\Models\Student;
use App\Enums\StudentStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Action: AdvanceStudentsLevelAction
 *
 * Gestiona el avance automático de nivel o el pase a revisión para alumnos que aprobaron.
 * Implementa lógica condicional para niveles terminales y tipos de examen.
 */
class AdvanceStudentsLevelAction
{
    /**
     * Ejecuta el avance de nivel para los alumnos aprobados del grupo.
     */
    public function executeForGroup(Group $group): void
    {
        $group->loadMissing('level');
        $levelName = $group->level->level_tecnm ?? '';
        $normalized = Str::of($levelName)->lower()->ascii()->squish()->toString();

        // 1. Identificamos alumnos aprobados (Promedio >= 70) que no desertaron
        $approvedStudentIds = $group->qualifications()
            ->where('is_left', false)
            ->where('final_average', '>=', 70)
            ->pluck('student_id');

        if ($approvedStudentIds->isEmpty()) {
            return;
        }

        // REGLA: Si es nivel terminal (Intermedio 5) o Programa Egresados, pasan a IN_REVIEW
        if ($normalized === 'intermedio 5' || str_contains($normalized, 'egresados')) {
            DB::transaction(function () use ($approvedStudentIds): void {
                Student::whereIn('id', $approvedStudentIds)
                    ->update(['status' => StudentStatus::IN_REVIEW->value]);
            });
            return;
        }

        // 2. Determinamos el siguiente nivel lógico dentro del mismo programa
        $nextLevel = Level::where('id', '>', $group->level_id)
            ->where('program_type', $group->level->program_type)
            ->orderBy('id')
            ->first();

        if (!$nextLevel) {
            Log::info('No next level found for group.', [
                'group_id' => $group->id,
                'current_level_id' => $group->level_id,
                'approved_count' => $approvedStudentIds->count(),
            ]);
            return;
        }

        DB::transaction(function () use ($approvedStudentIds, $nextLevel): void {
            // 3. Actualización masiva: Suben de nivel y pasan a WAITING para el siguiente ciclo
            Student::whereIn('id', $approvedStudentIds)
                ->update([
                    'level_id' => $nextLevel->id,
                    'status'   => StudentStatus::WAITING->value
                ]);
        });
    }

    /**
     * Gestiona el cambio de estado para alumnos de exámenes.
     */
    public function executeForExam(Exam $exam): void
    {
        $examType = Str::of($exam->exam_type->value ?? $exam->exam_type)->lower()->ascii()->toString();

        // Si el examen NO es de ubicación, pasan a revisión (IN_REVIEW)
        if (!str_contains($examType, 'ubicacion') && !str_contains($examType, 'placement')) {
            $exam->loadMissing('students');
            
            // Filtramos alumnos aprobados (pueden ser numéricos >= 70 o niveles MCER >= B1)
            $approvedStudentIds = [];
            foreach ($exam->students as $student) {
                if ($this->isApprovedExamResult($student->pivot)) {
                    $approvedStudentIds[] = $student->id;
                }
            }

            if (!empty($approvedStudentIds)) {
                DB::transaction(function () use ($approvedStudentIds): void {
                    Student::whereIn('id', $approvedStudentIds)
                        ->update(['status' => StudentStatus::IN_REVIEW->value]);
                });
            }
        }
    }

    /**
     * Helper: Determina si el resultado de un examen es aprobatorio.
     */
    private function isApprovedExamResult(mixed $pivot): bool
    {
        $units = $pivot->units_breakdown ?? [];
        if (is_string($units)) {
            $units = json_decode($units, true) ?? [];
        }

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
}
