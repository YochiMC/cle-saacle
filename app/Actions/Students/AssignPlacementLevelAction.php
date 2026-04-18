<?php

namespace App\Actions\Students;

use App\Models\Exam;
use App\Models\Student;
use App\Models\Level;
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
                // Buscamos coincidencia en el catálogo de niveles
                $level = Level::where('level_tecnm', 'like', "%{$assignedLevelName}%")->first();
                if ($level) {
                    $updates[$level->id][] = $student->id;
                }
            }
        }

        // Ejecución masiva por cada nivel identificado
        foreach ($updates as $levelId => $studentIds) {
            Student::whereIn('id', $studentIds)->update(['level_id' => $levelId]);
        }
    }

    /**
     * Helper para normalizar la lectura del JSON de calificaciones dinámicas.
     */
    private function extractUnits($pivot): array
    {
        $units = $pivot->units_breakdown ?? [];
        if (is_array($units)) return $units;
        if (is_string($units) && !empty($units)) return json_decode($units, true) ?? [];
        return [];
    }
}
