<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;
use App\Models\Level;
use App\Http\Requests\StoreLevelRequest;
use App\Http\Requests\UpdateLevelRequest;
use App\Http\Requests\BulkDeleteLevelsRequest;
use App\Traits\HandlesCatalogDeletion;
use Illuminate\Http\RedirectResponse;

/**
 * Controlador para la Gestión del Catálogo de Niveles de Idioma.
 */
class LevelController extends Controller
{
    use HandlesCatalogDeletion;

    public function store(StoreLevelRequest $request): RedirectResponse
    {
        Gate::authorize('create', Level::class);
        Level::create($request->validated());

        return redirect()->back()->with('success', 'Nivel creado correctamente.');
    }

    public function update(UpdateLevelRequest $request, Level $level): RedirectResponse
    {
        Gate::authorize('update', $level);
        $level->update($request->validated());

        return redirect()->back()->with('success', 'Nivel actualizado correctamente.');
    }

    public function destroy(Level $level): RedirectResponse
    {
        Gate::authorize('delete', $level);
        return $this->handleDeletion(
            fn() => $level->delete(),
            'Nivel eliminado correctamente.',
            'Ocurrió un error al intentar eliminar el nivel.'
        );
    }

    public function bulkDestroy(BulkDeleteLevelsRequest $request): RedirectResponse
    {
        Gate::authorize('deleteAny', Level::class);
        return $this->handleBulkDeletion(
            fn() => Level::whereIn('id', $request->validated()['ids'])->delete(),
            'Niveles eliminados correctamente.',
            'Ocurrió un error al intentar eliminar los niveles.'
        );
    }
}
