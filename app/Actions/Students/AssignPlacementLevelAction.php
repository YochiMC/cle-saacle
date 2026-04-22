<?php

namespace App\Actions\Students;

use App\Models\Level;
use App\Models\Exam;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Action: AssignPlacementLevelAction
 *
 * Procesa los resultados de un examen de Ubicación y asigna el nivel
 * correspondiente a cada alumno en su expediente principal.
 */
class AssignPlacementLevelAction
{
    /**
     * Ejecuta la asignación de niveles por examen de ubicación.
     */
    public function execute(Exam $exam): void
    {
        $examType = Str::of($exam->exam_type->value ?? $exam->exam_type)->lower()->ascii()->toString();

        // Restricción: Esta acción es exclusiva para procesos de Ubicación/Placement
        if (!str_contains($examType, 'ubicacion') && !str_contains($examType, 'placement')) {
            return;
        }

        $exam->load('students');
        $levels = Level::query()->get(['id', 'level_tecnm']);

        // Mapa para agrupar alumnos por el ID del nivel asignado y minimizar queries
        $updates = [];

        foreach ($exam->students as $student) {
            $pivot = $student->pivot;
            $units = $this->extractUnits($pivot);

            // Buscamos el nivel dentro de la estructura dinámica de la calificación
            $assignedLevelName = data_get($units, 'nivel_asignado')
                ?? data_get($units, 'nivel_certificado')
                ?? data_get($units, 'level');

            if ($assignedLevelName) {
                $normalizedName = $this->normalizeLevelName($assignedLevelName);
                $level = $levels->first(function (Level $catalogLevel) use ($normalizedName) {
                    return $this->normalizeLevelName($catalogLevel->level_tecnm) === $normalizedName;
                });

                // Fallback: coincidencia parcial no ambigua.
                if (!$level) {
                    $candidates = $levels->filter(function (Level $catalogLevel) use ($normalizedName) {
                        $normalizedCatalogName = $this->normalizeLevelName($catalogLevel->level_tecnm);

                        return str_contains($normalizedCatalogName, $normalizedName)
                            || str_contains($normalizedName, $normalizedCatalogName);
                    })->values();

                    if ($candidates->count() === 1) {
                        $level = $candidates->first();
                    } elseif ($candidates->count() > 1) {
                        Log::warning('Ambiguous level match in placement assignment.', [
                            'exam_id' => $exam->id,
                            'student_id' => $student->id,
                            'raw_level_name' => $assignedLevelName,
                            'normalized_level_name' => $normalizedName,
                            'candidate_ids' => $candidates->pluck('id')->all(),
                        ]);
                    }
                }

                if ($level) {
                    $updates[$level->id][] = $student->id;
                }
            }
        }

        DB::transaction(function () use ($updates): void {
            // Ejecución masiva por cada nivel identificado
            foreach ($updates as $levelId => $studentIds) {
                Student::whereIn('id', $studentIds)->update(['level_id' => $levelId]);
            }
        });
    }

    private function normalizeLevelName(?string $name): string
    {
        return Str::of((string) $name)->trim()->lower()->ascii()->squish()->toString();
    }

    /**
     * Helper para normalizar la lectura del JSON de calificaciones dinámicas.
     */
    private function extractUnits($pivot): array
    {
        $units = $pivot->units_breakdown ?? [];
        if (is_array($units)) return $units;
        if (is_string($units) && !empty($units)) {
            $decoded = json_decode($units, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::warning('Invalid JSON in units_breakdown.', [
                    'student_id' => $pivot->student_id ?? null,
                    'exam_id' => $pivot->exam_id ?? null,
                    'json_error' => json_last_error_msg(),
                ]);

                return [];
            }

            return $decoded ?? [];
        }
        return [];
    }
}
