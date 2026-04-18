<?php

namespace App\Http\Controllers;

use App\Actions\EnrollStudentsInGroup;
use App\Actions\UpdateGroupEvaluableUnits;
use App\Actions\BulkDeleteGroups;
use App\Actions\BulkUpdateGroupStatus;
use App\Actions\BulkUnenrollStudentsFromGroup;
use App\Enums\AcademicStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\BulkDeleteGroupsRequest;
use App\Http\Requests\BulkUnenrollRequest;
use App\Http\Requests\BulkUpdateGroupStatusRequest;
use App\Http\Requests\EnrollStudentsRequest;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Http\Requests\UpdateUnitsGroupRequest;
use App\Http\Resources\StudentQualificationResource;
use App\Models\Group;
use App\Models\Qualification;
use App\Services\GroupNamingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Thin Controller para la Gestión de Grupos Académicos.
 *
 * Aplica estrictamente el Principio de Responsabilidad Única (SRP):
 * - Las validaciones están aisladas en FormRequests.
 * - La lógica de negocio compleja (inscripción, recalculo de schema) está en Actions.
 * - El controlador solo orquesta: recibe, delega y redirige.
 */
class GroupController extends Controller
{
    /**
     * Lista todos los grupos con sus relaciones (Eager Loading anti N+1).
     */
    public function index()
    {
        $groups = Group::with(['level', 'teacher', 'period'])->get();
        return \App\Http\Resources\GroupResource::collection($groups);
    }

    /**
     * Crea un nuevo grupo.
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
     */
    public function update(
        UpdateGroupRequest $request, 
        Group $group, 
        GroupNamingService $namingService,
        \App\Actions\ResetModelQualifications $resetAction
    ): RedirectResponse {
        $validated = $request->validated();

        $mergedAttributes = array_merge($group->toArray(), $validated);
        $validated['name'] = $namingService->generateName($mergedAttributes);

        if (isset($validated['type']) && $validated['type'] !== $group->type->value) {
            $resetAction->execute($group);
        }

        $group->update($validated);

        return redirect()->back()->with('success', 'Grupo actualizado exitosamente.');
    }

    /**
     * Elimina un grupo.
     */
    public function destroy(Group $group): RedirectResponse
    {
        $group->delete();

        return redirect()->back()->with('success', 'Grupo eliminado exitosamente.');
    }

    /**
     * Eliminación masiva de grupos delegada a la capa de Acción.
     */
    public function bulkDestroy(BulkDeleteGroupsRequest $request, BulkDeleteGroups $action): RedirectResponse
    {
        $action->execute($request->validated('ids'));

        return redirect()->back()->with('success', 'Grupos eliminados exitosamente.');
    }

    /**
     * Actualización masiva de estado de grupos delegada a la capa de Acción.
     */
    public function bulkUpdateStatus(BulkUpdateGroupStatusRequest $request, BulkUpdateGroupStatus $action): RedirectResponse
    {
        $action->execute(
            $request->validated('ids'),
            $request->validated('new_status')
        );

        return redirect()->back()->with('success', 'Estados de grupos actualizados exitosamente.');
    }

    /**
     * Muestra el dashboard de un grupo con sus alumnos inscritos y calificaciones.
     */
    public function show(Group $group): Response
    {
        $qualifications = $group->qualifications()->with('student')->get();

        $enrolledStudents = $qualifications->map(function ($qualification) {
            $student = $qualification->student;
            $student->qualification = $qualification;
            return new StudentQualificationResource($student);
        });

        $enrolledIds = $group->qualifications()->pluck('student_id');
        $availableStudents = \App\Models\Student::whereNotIn('id', $enrolledIds)
            ->select('id', 'first_name', 'last_name', 'num_control')
            ->get();

        return Inertia::render('Groups/View', [
            'grupo'            => $group,
            'enrolledStudents' => $enrolledStudents,
            'availableStudents' => $availableStudents,
        ]);
    }

    /**
     * Inscribe alumnos en el grupo.
     *
     * Toda la lógica de negocio (schema de unidades, cálculo inicial de promedio,
     * transacción) está encapsulada en EnrollStudentsInGroup.
     */
    public function enroll(EnrollStudentsRequest $request, Group $group, EnrollStudentsInGroup $action): RedirectResponse
    {
        $action->execute($group, $request->validated('student_ids'));

        return redirect()->back()->with('success', 'Alumnos inscritos correctamente.');
    }

    /**
     * Da de baja a un solo alumno del grupo.
     */
    public function unenroll(Group $group, \App\Models\Student $student): RedirectResponse
    {
        Qualification::where('group_id', $group->id)
            ->where('student_id', $student->id)
            ->delete();

        return redirect()->back()->with('success', 'Alumno dado de baja del grupo.');
    }

    /**
     * Da de baja masiva de alumnos del grupo delegada a la capa de Acción.
     */
    public function bulkUnenroll(BulkUnenrollRequest $request, Group $group, BulkUnenrollStudentsFromGroup $action): RedirectResponse
    {
        $action->execute($group, $request->validated('ids'));

        return redirect()->back()->with('success', 'Alumnos seleccionados dados de baja correctamente.');
    }

    /**
     * Actualiza el número de unidades evaluables y reconcilia el JSON de calificaciones.
     *
     * Toda la lógica de negocio (recálculo de schema, regla isFailing, loop de actualización)
     * está encapsulada en UpdateGroupEvaluableUnits.
     */
    public function updateUnits(UpdateUnitsGroupRequest $request, Group $group, UpdateGroupEvaluableUnits $action): RedirectResponse
    {
        $action->execute($group, $request->validated('evaluable_units'));

        return redirect()->back()->with('success', 'Número de unidades actualizado.');
    }

    /**
     * Cierra definitivamente un grupo.
     */
    public function complete(Group $group): RedirectResponse
    {
        $group->update(['status' => AcademicStatus::COMPLETED]);

        return redirect()->back()->with('success', 'El grupo ha sido cerrado exitosamente. Ya no se permiten modificaciones.');
    }
}
