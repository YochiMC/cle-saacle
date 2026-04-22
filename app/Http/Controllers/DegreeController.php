<?php

namespace App\Http\Controllers;

use App\Models\Degree;
use App\Http\Requests\StoreDegreeRequest;
use App\Http\Requests\UpdateDegreeRequest;
use App\Http\Requests\BulkDeleteDegreesRequest;
use App\Traits\HandlesCatalogDeletion;
use Illuminate\Http\RedirectResponse;

/**
 * Controlador para la Gestión del Catálogo de Carreras / Programas Académicos.
 */
class DegreeController extends Controller
{
    use HandlesCatalogDeletion;

    public function store(StoreDegreeRequest $request): RedirectResponse
    {
        Degree::create($request->validated());

        return redirect()->back()->with('success', 'Carrera creada correctamente.');
    }

    public function update(UpdateDegreeRequest $request, Degree $degree): RedirectResponse
    {
        $degree->update($request->validated());

        return redirect()->back()->with('success', 'Carrera actualizada correctamente.');
    }

    public function destroy(Degree $degree): RedirectResponse
    {
        return $this->handleDeletion(
            fn() => $degree->delete(),
            'Carrera eliminada correctamente.',
            'Ocurrió un error al intentar eliminar la carrera.'
        );
    }

    public function bulkDestroy(BulkDeleteDegreesRequest $request): RedirectResponse
    {
        return $this->handleBulkDeletion(
            fn() => Degree::whereIn('id', $request->validated()['ids'])->delete(),
            'Carreras eliminados correctamente.',
            'Ocurrió un error al intentar eliminar las carreras.'
        );
    }
}
