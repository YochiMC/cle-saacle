<?php

namespace App\Http\Controllers;

use App\Models\Degree;
use App\Models\Student;
use App\Models\Teacher;
use App\Http\Requests\StoreDegreeRequest;
use App\Http\Requests\UpdateDegreeRequest;
use App\Http\Requests\BulkDeleteDegreesRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Database\QueryException;
use Inertia\Inertia;

/**
 * Controlador para la Gestión del Catálogo de Carreras / Programas Académicos.
 */
class DegreeController extends Controller
{


    /**
     * Almacena una nueva carrera.
     */
    public function store(StoreDegreeRequest $request): RedirectResponse
    {
        Degree::create($request->validated());

        return redirect()->back()->with('success', 'Carrera creada correctamente.');
    }

    /**
     * Actualiza una carrera existente.
     */
    public function update(UpdateDegreeRequest $request, Degree $degree): RedirectResponse
    {
        $degree->update($request->validated());

        return redirect()->back()->with('success', 'Carrera actualizada correctamente.');
    }

    /**
     * Elimina una carrera.
     */
    public function destroy(Degree $degree): RedirectResponse
    {
        try {
            $degree->delete();

            return redirect()->back()->with('success', 'Carrera eliminada correctamente.');
        } catch (QueryException $e) {
            if ($e->getCode() == 23000) {
                return redirect()->back()->with('error', 'No se puede eliminar uno o más registros porque están en uso en otras partes del sistema.');
            }

            return redirect()->back()->with('error', 'Ocurrió un error al intentar eliminar la carrera.');
        }
    }

    /**
     * Elimina carreras masivamente.
     */
    public function bulkDestroy(BulkDeleteDegreesRequest $request): RedirectResponse
    {
        try {
            Degree::whereIn('id', $request->validated()['ids'])->delete();

            return redirect()->back()->with('success', 'Carreras eliminadas correctamente.');
        } catch (QueryException $e) {
            if ($e->getCode() == 23000) {
                return redirect()->back()->with('error', 'No se puede eliminar uno o más registros porque están en uso en otras partes del sistema.');
            }

            return redirect()->back()->with('error', 'Ocurrió un error al intentar eliminar las carreras.');
        }
    }
}
