<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Http\Requests\BulkDeleteGroupsRequest;
use App\Http\Requests\BulkUpdateGroupStatusRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Resources\StudentQualificationResource;

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

    public function show(Group $group)
    {
        // 1. Eager Loading: Traemos las calificaciones y de paso cargamos al alumno de cada una.
        // El ->get() es vital porque ejecuta la consulta en la base de datos.
        $qualifications = $group->qualifications()->with('student')->get();

        // 2. Transformación: Recorremos las calificaciones para "aplanar" los datos
        // usando el Resource que creaste.
        $enrolledStudents = $qualifications->map(function ($qualification) {

            // Extraemos el modelo del estudiante
            $student = $qualification->student;

            // Le asignamos dinámicamente la calificación al estudiante
            // para que tu Resource la detecte y la aplane
            $student->qualification = $qualification;

            // Pasamos el estudiante por el Resource
            return new StudentQualificationResource($student);
        });

        // 3. Retornamos la vista enviando los datos limpios
        return Inertia::render('Test_MK2/GroupView', [
            'grupo' => $group,
            'enrolledStudents' => $enrolledStudents
        ]);
    }
}
