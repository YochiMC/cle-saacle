<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use Illuminate\Http\RedirectResponse;

/**
 * Controlador para la gestión de grupos académicos.
 * Maneja la lógica de persistencia (Creación, Actualización, Eliminación).
 */
class GroupController extends Controller
{
    /**
     * Almacena un nuevo grupo en la base de datos.
     *
     * @param StoreGroupRequest $request
     * @return RedirectResponse
     */
    public function store(StoreGroupRequest $request): RedirectResponse
    {
        Group::create($request->validated());

        return redirect()->back()->with('success', 'Grupo creado exitosamente.');
    }

    /**
     * Actualiza un grupo existente en la base de datos.
     *
     * @param UpdateGroupRequest $request
     * @param Group $group
     * @return RedirectResponse
     */
    public function update(UpdateGroupRequest $request, Group $group): RedirectResponse
    {
        $group->update($request->validated());

        return redirect()->back()->with('success', 'Grupo actualizado exitosamente.');
    }

    /**
     * Elimina un grupo de la base de datos.
     *
     * @param Group $group
     * @return RedirectResponse
     */
    public function destroy(Group $group): RedirectResponse
    {
        $group->delete();
        
        return redirect()->back()->with('success', 'Grupo eliminado exitosamente.');
    }
}
