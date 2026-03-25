<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\Qualification;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Http\Requests\BulkDeleteGroupsRequest;
use App\Http\Requests\BulkUpdateGroupStatusRequest;
use App\Http\Requests\EnrollStudentsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Resources\StudentQualificationResource;
use App\Services\GroupNamingService;

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
    public function store(StoreGroupRequest $request, GroupNamingService $namingService): RedirectResponse
    {
        $validated = $request->validated();
        $validated['name'] = $namingService->generateName($validated);

        Group::create($validated);

        return redirect()->back()->with('success', 'Grupo creado exitosamente.');
    }

    /**
     * Actualiza los datos de un grupo existente.
     *
     * @param UpdateGroupRequest $request Datos validados de actualización.
     * @param Group $group Instancia del modelo a modificar.
     * @return RedirectResponse Redirección con mensaje de éxito.
     */
    public function update(UpdateGroupRequest $request, Group $group, GroupNamingService $namingService): RedirectResponse
    {
        $validated = $request->validated();

        // Fusionamos con los atributos actuales para que el nombre no pierda datos no enviados
        $mergedAttributes = array_merge($group->toArray(), $validated);
        $validated['name'] = $namingService->generateName($mergedAttributes);

        $group->update($validated);

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

        // Alumnos disponibles para inscripción
        $enrolledIds = $group->qualifications()->pluck('student_id');
        $availableStudents = \App\Models\Student::whereNotIn('id', $enrolledIds)
            ->select('id', 'first_name', 'last_name', 'num_control')
            ->get();

        // 3. Retornamos la vista enviando los datos limpios
        return Inertia::render('Test_MK2/GroupView', [
            'grupo'             => $group,
            'enrolledStudents'  => $enrolledStudents,
            'availableStudents' => $availableStudents,
        ]);
    }

    /**
     * Inscribe alumnos al grupo.
     */
    public function enroll(EnrollStudentsRequest $request, Group $group): RedirectResponse
    {
        DB::transaction(function () use ($request, $group) {
            foreach ($request->validated('student_ids') as $studentId) {
                Qualification::create([
                    'group_id' => $group->id,
                    'student_id' => $studentId,
                    'unit_1' => 0,
                    'unit_2' => 0,
                    'final_average' => 0,
                    'is_approved' => false,
                    'is_left' => false,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Alumnos inscritos correctamente.');
    }

    /**
     * Da de baja a un solo alumno del grupo.
     */
    public function unenroll(\App\Models\Group $group, \App\Models\Student $student): \Illuminate\Http\RedirectResponse
    {
        \App\Models\Qualification::where('group_id', $group->id)
            ->where('student_id', $student->id)
            ->delete();

        return redirect()->back()->with('success', 'Alumno dado de baja del grupo.');
    }

    /**
     * Da de baja a múltiples alumnos del grupo.
     */
    public function bulkUnenroll(\Illuminate\Http\Request $request, \App\Models\Group $group): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:students,id'
        ]);

        \App\Models\Qualification::where('group_id', $group->id)
            ->whereIn('student_id', $request->ids)
            ->delete();

        return redirect()->back()->with('success', 'Alumnos seleccionados dados de baja.');
    }
}
