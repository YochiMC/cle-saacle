<?php

namespace App\Http\Controllers;

use App\Models\Qualification;
use App\Http\Requests\UpdateQualificationsRequest;
use Illuminate\Support\Facades\DB;

/**
 * Controlador de calificaciones individuales de Grupos.
 *
 * Thin Controller: delega validación a FormRequests y orquesta la persistencia.
 * Los métodos sin rutas activas (getQualifications, createQualification, deleteQualification)
 * han sido eliminados por ser código muerto.
 */
class QualificationController extends Controller
{
    /**
     * Actualiza una sola calificación de grupo.
     *
     * Usa UpdateQualificationsRequest que ya contempla la misma lógica de validación,
     * eliminando la duplicación inline que tenía el método original.
     */
    public function update(UpdateQualificationsRequest $request, Qualification $qualification)
    {
        $qualification->update($request->validated());

        return redirect()->back()->with('success', 'Calificación individual guardada exitosamente.');
    }

    /**
     * Actualiza masivamente un array de calificaciones desde GroupView.
     *
     * El contrato viene serializado desde el frontend: units_breakdown + final_average + is_left.
     */
    public function bulkUpdate(UpdateQualificationsRequest $request)
    {
        DB::transaction(function () use ($request) {
            foreach ($request->validated('qualifications') as $item) {
                Qualification::where('id', $item['qualification_id'])->update([
                    'units_breakdown' => $item['units_breakdown'] ?? [],
                    'final_average'   => $item['final_average'] ?? 0,
                    'is_left'         => $item['is_left'] ?? false,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Calificaciones guardadas exitosamente.');
    }
}
