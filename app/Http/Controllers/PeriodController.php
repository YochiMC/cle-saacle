<?php

namespace App\Http\Controllers;

use App\Models\Period;
use App\Http\Requests\StorePeriodRequest;
use App\Http\Requests\UpdatePeriodRequest;
use App\Http\Requests\BulkDeletePeriodsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Database\QueryException;

/**
 * Controlador para la Gestión del Catálogo de Periodos.
 *
 * Implementa el patrón Thin Controller para servir como endpoint exclusivo
 * de mutaciones, retornando siempre a la vista principal en Inertia.
 */
class PeriodController extends Controller
{
    /**
     * Almacena un nuevo periodo.
     */
    public function store(StorePeriodRequest $request): RedirectResponse
    {
        Period::create($request->validated());

        return redirect()->back()->with('success', 'Periodo creado correctamente.');
    }

    /**
     * Actualiza un periodo existente.
     */
    public function update(UpdatePeriodRequest $request, Period $period): RedirectResponse
    {
        $period->update($request->validated());

        return redirect()->back()->with('success', 'Periodo actualizado correctamente.');
    }

    /**
     * Elimina un periodo.
     */
    public function destroy(Period $period): RedirectResponse
    {
        try {
            $period->delete();

            return redirect()->back()->with('success', 'Periodo eliminado correctamente.');
        } catch (QueryException $e) {
            if ($e->getCode() == 23000) {
                return redirect()->back()->with('error', 'No se puede eliminar uno o más registros porque están en uso en otras partes del sistema.');
            }

            return redirect()->back()->with('error', 'Ocurrió un error al intentar eliminar el periodo.');
        }
    }

    /**
     * Elimina periodos masivamente.
     */
    public function bulkDestroy(BulkDeletePeriodsRequest $request): RedirectResponse
    {
        try {
            Period::whereIn('id', $request->validated()['ids'])->delete();

            return redirect()->back()->with('success', 'Periodos eliminados correctamente.');
        } catch (QueryException $e) {
            if ($e->getCode() == 23000) {
                return redirect()->back()->with('error', 'No se puede eliminar uno o más registros porque están en uso en otras partes del sistema.');
            }

            return redirect()->back()->with('error', 'Ocurrió un error al intentar eliminar los periodos.');
        }
    }
}
