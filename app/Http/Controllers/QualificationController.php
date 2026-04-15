<?php

namespace App\Http\Controllers;

use App\Models\Qualification;
use App\Http\Requests\UpdateQualificationsRequest;
use App\Http\Requests\BulkUpdateGroupQualificationsRequest;
use App\Actions\BulkUpdateGroupQualifications;
use Illuminate\Http\RedirectResponse;

/**
 * Controlador para la Gestión de Calificaciones de Grupos Académicos.
 * 
 * Implementa el patrón Thin Controller:
 * - Validación delegada a FormRequests.
 * - Lógica de persistencia compleja delegada a Actions.
 */
class QualificationController extends Controller
{
    /**
     * Actualiza una sola calificación de forma individual.
     * 
     * @param UpdateQualificationsRequest $request
     * @param Qualification $qualification
     * @return RedirectResponse
     */
    public function update(UpdateQualificationsRequest $request, Qualification $qualification): RedirectResponse
    {
        $qualification->update($request->validated());

        return redirect()->back()->with('success', 'Calificación individual guardada exitosamente.');
    }

    /**
     * Actualiza masivamente un lote de calificaciones de un grupo.
     * 
     * Delegamos la transacción y el bucle de persistencia a la acción 
     * BulkUpdateGroupQualifications para mantener el controlador "delgado".
     * 
     * @param BulkUpdateGroupQualificationsRequest $request
     * @param BulkUpdateGroupQualifications $action
     * @return RedirectResponse
     */
    public function bulkUpdate(BulkUpdateGroupQualificationsRequest $request, BulkUpdateGroupQualifications $action): RedirectResponse
    {
        $action->execute($request->validated('qualifications'));

        return redirect()->back()->with('success', 'Calificaciones del grupo guardadas exitosamente.');
    }
}
