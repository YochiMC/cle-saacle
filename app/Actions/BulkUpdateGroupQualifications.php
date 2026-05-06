<?php

namespace App\Actions;

use App\Models\Qualification;
use Illuminate\Support\Facades\DB;

/**
 * Encapsula la persistencia masiva de calificaciones de un grupo.
 * 
 * Asegura la atomicidad mediante transacciones de base de datos para evitar
 * inconsistencias en los promedios calculados por el frontend.
 */
class BulkUpdateGroupQualifications
{
    /**
     * Ejecuta la actualización masiva de calificaciones.
     *
     * @param array $qualificationsData Array validado conteniendo los desgloses y promedios.
     * @return void
     */
    public function execute(array $qualificationsData): void
    {
        DB::transaction(function () use ($qualificationsData) {
            foreach ($qualificationsData as $data) {
                $qualification = Qualification::findOrFail($data['qualification_id']);
                $qualification->update([
                    'units_breakdown' => $data['units_breakdown'] ?? [],
                    'final_average'   => $data['final_average'] ?? 0,
                    'is_left'         => $data['is_left'] ?? false,
                    'attempt'         => $data['attempt'] ?? 'first',
                ]);
            }
        });
    }
}
