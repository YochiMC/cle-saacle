<?php

namespace App\Http\Controllers;

use App\Models\TypeStudent;
use App\Http\Requests\StoreTypeStudentRequest;
use App\Http\Requests\UpdateTypeStudentRequest;
use App\Http\Requests\BulkDeleteTypeStudentsRequest;
use App\Traits\HandlesCatalogDeletion;
use Illuminate\Http\RedirectResponse;

/**
 * Controlador para la Gestión del Catálogo de Tipos de Alumnos.
 */
class TypeStudentController extends Controller
{
    use HandlesCatalogDeletion;

    public function store(StoreTypeStudentRequest $request): RedirectResponse
    {
        TypeStudent::create($request->validated());

        return redirect()->back()->with('success', 'Tipo de alumno creado correctamente.');
    }

    public function update(UpdateTypeStudentRequest $request, TypeStudent $typeStudent): RedirectResponse
    {
        $typeStudent->update($request->validated());

        return redirect()->back()->with('success', 'Tipo de alumno actualizado correctamente.');
    }

    public function destroy(TypeStudent $typeStudent): RedirectResponse
    {
        return $this->handleDeletion(
            fn() => $typeStudent->delete(),
            'Tipo de alumno eliminado correctamente.',
            'Ocurrió un error al intentar eliminar el tipo de alumno.'
        );
    }

    public function bulkDestroy(BulkDeleteTypeStudentsRequest $request): RedirectResponse
    {
        return $this->handleBulkDeletion(
            fn() => TypeStudent::whereIn('id', $request->validated()['ids'])->delete(),
            'Tipos de alumno eliminados correctamente.',
            'Ocurrió un error al intentar eliminar los tipos de alumno.'
        );
    }
}
