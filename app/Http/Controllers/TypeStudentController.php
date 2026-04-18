<?php

namespace App\Http\Controllers;

use App\Models\TypeStudent;
use App\Http\Requests\StoreTypeStudentRequest;
use App\Http\Requests\UpdateTypeStudentRequest;
use App\Http\Requests\BulkDeleteTypeStudentsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Database\QueryException;

/**
 * Controlador para la Gestión del Catálogo de Tipos de Alumnos.
 */
class TypeStudentController extends Controller
{


    /**
     * Almacena un nuevo tipo de alumno.
     */
    public function store(StoreTypeStudentRequest $request): RedirectResponse
    {
        TypeStudent::create($request->validated());

        return redirect()->back()->with('success', 'Tipo de alumno creado correctamente.');
    }

    /**
     * Actualiza un tipo de alumno existente.
     */
    public function update(UpdateTypeStudentRequest $request, TypeStudent $typeStudent): RedirectResponse
    {
        $typeStudent->update($request->validated());

        return redirect()->back()->with('success', 'Tipo de alumno actualizado correctamente.');
    }

    /**
     * Elimina un tipo de alumno.
     */
    public function destroy(TypeStudent $typeStudent): RedirectResponse
    {
        try {
            $typeStudent->delete();

            return redirect()->back()->with('success', 'Tipo de alumno eliminado correctamente.');
        } catch (QueryException $e) {
            if ($e->getCode() == 23000) {
                return redirect()->back()->with('error', 'No se puede eliminar uno o más registros porque están en uso en otras partes del sistema.');
            }

            return redirect()->back()->with('error', 'Ocurrió un error al intentar eliminar el tipo de alumno.');
        }
    }

    /**
     * Elimina tipos de alumno masivamente.
     */
    public function bulkDestroy(BulkDeleteTypeStudentsRequest $request): RedirectResponse
    {
        try {
            TypeStudent::whereIn('id', $request->validated()['ids'])->delete();

            return redirect()->back()->with('success', 'Tipos de alumno eliminados correctamente.');
        } catch (QueryException $e) {
            if ($e->getCode() == 23000) {
                return redirect()->back()->with('error', 'No se puede eliminar uno o más registros porque están en uso en otras partes del sistema.');
            }

            return redirect()->back()->with('error', 'Ocurrió un error al intentar eliminar los tipos de alumno.');
        }
    }
}
