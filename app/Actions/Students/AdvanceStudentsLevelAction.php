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
        // Reutilizamos la lógica de aprobación estándar (Promedio >= 70 o MCER >= B1)
        if (is_numeric($pivot->final_average) && (float) $pivot->final_average >= 70) {
            return true;
        }

        $units = $pivot->units_breakdown ?? [];
        if (is_string($units)) $units = json_decode($units, true) ?? [];

        $cefrCandidates = [
            data_get($units, 'promedio_habilidades'),
            data_get($units, 'nivel_certificado'),
            data_get($units, 'speaking'),
        ];

        foreach ($cefrCandidates as $candidate) {
            $value = Str::upper(trim((string) $candidate));
            if (in_array($value, ['B1', 'B2', 'C1', 'C2'], true)) {
                return true;
            }
        }

        return false;
    }
}
