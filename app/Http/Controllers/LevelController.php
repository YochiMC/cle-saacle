<?php

namespace App\Http\Controllers;

use App\Models\Level;
use App\Http\Requests\StoreLevelRequest;
use App\Http\Requests\UpdateLevelRequest;
use App\Http\Requests\BulkDeleteLevelsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Database\QueryException;

/**
 * Controlador para la Gestión del Catálogo de Niveles de Idioma.
 *
 * Implementa el patrón Thin Controller con validación delegada y
 * retornos compatibles con el ciclo de vida de Inertia.js.
 */
class LevelController extends Controller
{


    /**
     * Almacena un nuevo nivel de idioma.
     */
    public function store(StoreLevelRequest $request): RedirectResponse
    {
        Level::create($request->validated());

        return redirect()->back()->with('success', 'Nivel creado correctamente.');
    }

    /**
     * Actualiza un nivel de idioma existente.
     */
    public function update(UpdateLevelRequest $request, Level $level): RedirectResponse
    {
        $level->update($request->validated());

        return redirect()->back()->with('success', 'Nivel actualizado correctamente.');
    }

    /**
     * Elimina un nivel de idioma.
     */
    public function destroy(Level $level): RedirectResponse
    {
        try {
            $level->delete();

            return redirect()->back()->with('success', 'Nivel eliminado correctamente.');
        } catch (QueryException $e) {
            if ($e->getCode() == 23000) {
                return redirect()->back()->with('error', 'No se puede eliminar uno o más registros porque están en uso en otras partes del sistema.');
            }

            return redirect()->back()->with('error', 'Ocurrió un error al intentar eliminar el nivel.');
        }
    }

    /**
     * Elimina niveles masivamente.
     */
    public function bulkDestroy(BulkDeleteLevelsRequest $request): RedirectResponse
    {
        try {
            Level::whereIn('id', $request->validated()['ids'])->delete();

            return redirect()->back()->with('success', 'Niveles eliminados correctamente.');
        } catch (QueryException $e) {
            if ($e->getCode() == 23000) {
                return redirect()->back()->with('error', 'No se puede eliminar uno o más registros porque están en uso en otras partes del sistema.');
            }

            return redirect()->back()->with('error', 'Ocurrió un error al intentar eliminar los niveles.');
        }
    }
}
