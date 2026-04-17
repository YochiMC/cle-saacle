<?php

namespace App\Http\Controllers;

use App\Models\Level;
use App\Http\Requests\StoreLevelRequest;
use App\Http\Requests\UpdateLevelRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Controlador para la Gestión del Catálogo de Niveles de Idioma.
 * 
 * Implementa el patrón Thin Controller con validación delegada y
 * retornos compatibles con el ciclo de vida de Inertia.js.
 */
class LevelController extends Controller
{
    /**
     * Lista todos los niveles registrados.
     */
    public function index()
    {
        return Level::all();
    }

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
        $level->delete();

        return redirect()->back()->with('success', 'Nivel eliminado correctamente.');
    }
}
