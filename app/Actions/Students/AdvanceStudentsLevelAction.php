<?php

namespace App\Actions\Students;

use App\Models\Group;
use App\Models\Level;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Action: AdvanceStudentsLevelAction
 *
 * Gestiona el avance automático de nivel para alumnos que aprobaron su curso regular.
 * No aplica para niveles terminales (Intermedio 5 o Programa Egresados).
 */
class AdvanceStudentsLevelAction
{
    /**
     * Ejecuta el avance de nivel para los alumnos aprobados del grupo.
     */
    public function execute(Group $group): void
    {
        $group->loadMissing('level');
        $levelName = $group->level->level_tecnm ?? '';
        $normalized = Str::of($levelName)->lower()->ascii()->squish()->toString();

        // Excepción: Niveles terminales o de egresados no avanzan nivel aquí (van a dictaminación)
        if ($normalized === 'intermedio 5' || str_contains($normalized, 'egresados')) {
            return;
        }

        // 1. Identificamos alumnos aprobados (Promedio >= 70) que no desertaron
        $approvedStudentIds = $group->qualifications()
            ->where('is_left', false)
            ->where('final_average', '>=', 70)
            ->pluck('student_id');

        if ($approvedStudentIds->isEmpty()) {
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
            // 3. Actualización masiva de la tabla students (evitamos bug de tabla pivote)
            Student::whereIn('id', $approvedStudentIds)
                ->update(['level_id' => $nextLevel->id]);
        });
    }
}
