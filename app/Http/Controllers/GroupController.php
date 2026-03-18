<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Enums\GroupStatus;

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

    /**
     * Elimina múltiples grupos de la base de datos de manera masiva.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:groups,id'
        ]);

        Group::whereIn('id', $request->ids)->delete();

        return redirect()->back()->with('success', 'Grupos eliminados exitosamente.');
    }

    /**
     * Actualiza el estado de múltiples grupos de manera masiva.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function bulkUpdateStatus(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:groups,id',
            'new_status' => ['required', Rule::enum(GroupStatus::class)]
        ]);

        Group::whereIn('id', $request->ids)->update(['status' => $request->new_status]);

        return redirect()->back()->with('success', 'Estados de grupos actualizados exitosamente.');
    }
}
