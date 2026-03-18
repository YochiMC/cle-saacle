<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Http\Requests\BulkDeleteGroupsRequest;
use App\Http\Requests\BulkUpdateGroupStatusRequest;
use Illuminate\Http\RedirectResponse;

/**
 * Controlador de Alto Nivel para la Gestión de Grupos Académicos.
 * 
 * Sigue el principio de Responsabilidad Única (SRP) delegando validaciones a Form Requests
 * y concentrándose en la orquestación de la persistencia y redirección.
 */
class GroupController extends Controller
{
    /**
     * Persiste un nuevo grupo en el sistema.
     *
     * @param StoreGroupRequest $request Datos validados de creación.
     * @return RedirectResponse Redirección con mensaje de éxito.
     */
    public function store(StoreGroupRequest $request): RedirectResponse
    {
        Group::create($request->validated());

        return redirect()->back()->with('success', 'Grupo creado exitosamente.');
    }

    /**
     * Actualiza los datos de un grupo existente.
     *
     * @param UpdateGroupRequest $request Datos validados de actualización.
     * @param Group $group Instancia del modelo a modificar.
     * @return RedirectResponse Redirección con mensaje de éxito.
     */
    public function update(UpdateGroupRequest $request, Group $group): RedirectResponse
    {
        $group->update($request->validated());

        return redirect()->back()->with('success', 'Grupo actualizado exitosamente.');
    }

    /**
     * Elimina físicamente un grupo de la base de datos.
     *
     * @param Group $group Instancia del modelo a eliminar.
     * @return RedirectResponse Redirección con mensaje de éxito.
     */
    public function destroy(Group $group): RedirectResponse
    {
        $group->delete();
        
        return redirect()->back()->with('success', 'Grupo eliminado exitosamente.');
    }

    /**
     * Realiza una eliminación masiva de grupos basada en un array de identificadores.
     * 
     * @param BulkDeleteGroupsRequest $request Contiene el array 'ids' ya validado contra la existencia en BD.
     * @return RedirectResponse Redirección con mensaje de éxito.
     */
    public function bulkDestroy(BulkDeleteGroupsRequest $request): RedirectResponse
    {
        Group::whereIn('id', $request->validated('ids'))->delete();

        return redirect()->back()->with('success', 'Grupos eliminados');
    }

    /**
     * Actualiza el estado de múltiples grupos de manera atómica.
     * 
     * @param BulkUpdateGroupStatusRequest $request Contiene 'ids' y 'new_status' validados.
     * @return RedirectResponse Redirección con mensaje de éxito.
     */
    public function bulkUpdateStatus(BulkUpdateGroupStatusRequest $request): RedirectResponse
    {
        Group::whereIn('id', $request->validated('ids'))
            ->update(['status' => $request->validated('new_status')]);

        return redirect()->back()->with('success', 'Estados de grupos actualizados exitosamente.');
    }
}
