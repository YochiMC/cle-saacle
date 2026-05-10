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
 * Action: RevertStudentsLevelAction
 *
 * Se encarga de revertir los cambios en el expediente del alumno (nivel y estado)
 * cuando un Grupo o Examen es reabierto después de haber sido marcado como completado.
 */
class RevertStudentsLevelAction
{
    /**
     * Revierte la promoción de nivel para los alumnos de un grupo regular.
     */
    public function executeForGroup(Group $group): void
    {
        $group->loadMissing('level');
        if (!$group->level) return;

        // 1. Determinar el nivel al que fueron promovidos
        $nextLevel = Level::where('id', '>', $group->level_id)
            ->where('program_type', $group->level->program_type)
            ->orderBy('id')
            ->first();

        $studentIds = $group->students()->pluck('students.id');

        if ($studentIds->isEmpty()) return;

        DB::transaction(function () use ($studentIds, $nextLevel, $group): void {
            if ($nextLevel) {
                // Revertir nivel SOLO si el alumno sigue en el nivel al que fue promovido
                Student::whereIn('id', $studentIds)
                    ->where('level_id', $nextLevel->id)
                    ->update(['level_id' => $group->level_id]);
            }

            // 2. Revertir estado y limpiar datos de acreditación residuales
            $students = Student::whereIn('id', $studentIds)
                ->whereIn('status', [StudentStatus::WAITING->value, StudentStatus::IN_REVIEW->value])
                ->get();

            foreach ($students as $student) {
                $student->status = StudentStatus::VALIDATED;
                $student->save();

                $this->purgeAccreditationData($student);
            }
        });
    }

    /**
     * Revierte la asignación de nivel y el estatus para alumnos en un examen.
     */
    public function executeForExam(Exam $exam): void
    {
        $exam->load('students');
        $examType = Str::of($exam->exam_type->value ?? $exam->exam_type)->lower()->ascii()->toString();
        $isPlacement = str_contains($examType, 'ubicacion') || str_contains($examType, 'placement');

        DB::transaction(function () use ($exam, $isPlacement): void {
            foreach ($exam->students as $student) {
                $shouldSave = false;

                // 1. Reversión de Estado: Al reabrir un examen, regresan a validación si estaban en WAITING o IN_REVIEW
                if ($student->status === StudentStatus::WAITING || $student->status === StudentStatus::IN_REVIEW) {
                    $student->status = StudentStatus::VALIDATED;
                    $shouldSave = true;
                    
                    // Limpieza de datos residuales si el examen otorgaba acreditación
                    $this->purgeAccreditationData($student);
                }

                // 2. Reversión de Nivel: Específico para Ubicación/Placement
                if ($isPlacement) {
                    $units = $this->extractUnits($student->pivot);
                    $assignedLevelName = data_get($units, 'nivel_asignado')
                        ?? data_get($units, 'nivel_certificado')
                        ?? data_get($units, 'level');

                    if ($assignedLevelName) {
                        $levelId = $this->resolveLevelIdByName($assignedLevelName);
                        
                        // Solo revertimos si el nivel actual coincide con el asignado por el examen.
                        if ($levelId && $student->level_id === $levelId) {
                            $student->level_id = null;
                            $shouldSave = true;
                        }
                    }
                }

                if ($shouldSave) {
                    $student->save();
                }
            }
        });
    }

    /**
     * Purgado de datos relacionados a la intención de acreditación.
     * 
     * Nota Arquitectónica: Las columnas 'accreditation_source' y 'accreditation_date' 
     * fueron eliminadas de la tabla 'students' para normalizar el esquema.
     * Este método queda como punto de extensión para limpiar registros en tablas 
     * externas de acreditación si se implementan en el futuro.
     */
    private function purgeAccreditationData(Student $student): void
    {
        // En este momento, la "intención" es puramente el estado IN_REVIEW.
        // Si existieran registros en una tabla 'accreditation_candidates', se eliminarían aquí.
    }

    private function resolveLevelIdByName(string $name): ?int
    {
        $normalized = Str::of($name)->trim()->lower()->ascii()->squish()->toString();
        return Level::all()->first(function ($level) use ($normalized) {
            $catalogNormalized = Str::of($level->level_tecnm)->trim()->lower()->ascii()->squish()->toString();
            return $catalogNormalized === $normalized;
        })?->id;
    }

    private function extractUnits($pivot): array
    {
        $units = $pivot->units_breakdown ?? [];
        if (is_array($units)) return $units;
        if (is_string($units) && !empty($units)) {
            return json_decode($units, true) ?? [];
        }
        return [];
    }
}
