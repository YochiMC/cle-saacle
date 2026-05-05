<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use App\Actions\EnrollStudentsInGroup;
use App\Actions\BulkUnenrollStudentsFromGroup;
use App\Models\Group;
use App\Enums\StudentStatus;
use App\Services\EnrollmentWindowResolver;

class SelfEnrollmentController extends Controller
{
    /**
     * Permite que un alumno se inscriba a un grupo por sí mismo.
     *
     * Reglas aplicadas:
     * - Autorización vía policy `enroll`.
     * - Verifica que el alumno no esté ya inscrito.
     * - Valida que estemos dentro del periodo de inscripción (vía Period del grupo o activo).
     * - Valida que el alumno sea elegible (estado ELEGIBLE_INSCRIPCION o pago aprobado de tipo CURSO).
     * - Usa `EnrollStudentsInGroup` para crear la Qualification y marca al alumno como `ESPERA_INSCRIPCION`.
     */
    public function enroll(Group $group, EnrollStudentsInGroup $action, BulkUnenrollStudentsFromGroup $bulkAction, Request $request, EnrollmentWindowResolver $windowResolver): RedirectResponse
    {
        Gate::authorize('enroll', $group);

        $user = Auth::user();
        if (! $user?->hasRole('student') || ! $user->student) {
            abort(403);
        }

        $student = $user->student;
        $studentStatus = $student->status;

        if (! $studentStatus?->canAccessEnrollmentCatalog()) {
            return back()->with('warning', 'Tu estatus actual no permite iniciar inscripciones.');
        }

        // Evitar doble inscripción
        if ($group->qualifications()->withoutTrashed()->where('student_id', $student->id)->exists()) {
            return back()->with('warning', 'Ya estás inscrito en este grupo.');
        }

        // Comprueba periodo: usa el periodo del grupo si existe, sino busca el activo que cubre hoy
        $period = $group->period ?? $windowResolver->resolveActivePeriod();

        if (! $period) {
            return back()->with('warning', 'No hay un periodo activo configurado para inscripción.');
        }

        if (! $windowResolver->isOpen($period)) {
            return back()->with('warning', 'Las inscripciones están fuera de las fechas del periodo.');
        }

        $groupType = $group->type?->value ?? $group->type;
        $approvedCourseTypes = $student->approvedCourseTypeValues();

        if (! in_array($groupType, $approvedCourseTypes, true)) {
            return back()->with('warning', 'El grupo no coincide con tu concepto de pago aprobado.');
        }

        if ($groupType === 'Regular' && (int) $group->level_id !== (int) $student->level_id) {
            return back()->with('warning', 'El grupo no coincide con tu nivel académico actual.');
        }

        // Si el alumno ya está inscrito en otro(s) grupo(s), darlo de baja primero
        $currentGroupIds = $student->qualifications()
            ->withoutTrashed()
            ->pluck('group_id')
            ->filter(fn($id) => $id !== $group->id)
            ->unique()
            ->values()
            ->all();

        foreach ($currentGroupIds as $oldGroupId) {
            $oldGroup = Group::query()->where('id', $oldGroupId)->first();
            if ($oldGroup) {
                $bulkAction->execute($oldGroup, [$student->id]);
            }
        }

        // Ejecutar la acción de inscripción y marcar al alumno en espera de inscripción
        $action->execute($group, [$student->id]);

        $student->update(['status' => StudentStatus::ESPERA_INSCRIPCION->value]);

        return back()->with('success', 'Solicitud de inscripción enviada. Estás en espera de inscripción.');
    }
}
