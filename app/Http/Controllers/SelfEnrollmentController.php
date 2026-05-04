<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use App\Actions\EnrollStudentsInGroup;
use App\Actions\BulkUnenrollStudentsFromGroup;
use App\Models\Group;
use App\Models\Period;
use App\Enums\StudentStatus;
use App\Enums\ServiceStatus;
use App\Enums\ServiceType;

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
    public function enroll(Group $group, EnrollStudentsInGroup $action, BulkUnenrollStudentsFromGroup $bulkAction, Request $request): RedirectResponse
    {
        Gate::authorize('enroll', $group);

        $user = Auth::user();
        if (! $user?->hasRole('student') || ! $user->student) {
            abort(403);
        }

        $student = $user->student;

        // Evitar doble inscripción
        if ($group->qualifications()->where('student_id', $student->id)->exists()) {
            return back()->with('warning', 'Ya estás inscrito en este grupo.');
        }

        // Comprueba periodo: usa el periodo del grupo si existe, sino el periodo activo
        $period = $group->period ?? Period::where('is_active', true)->first();
        if (! $period) {
            return back()->with('warning', 'No hay un periodo activo configurado para inscripción.');
        }

        $today = now()->startOfDay();
        $start = $period->start_date?->startOfDay();
        $end = $period->end_date?->endOfDay();

        if (! ($start && $end && $today->between($start, $end))) {
            return back()->with('warning', 'Las inscripciones están fuera de las fechas del periodo.');
        }

        // Verificar elegibilidad: estado del alumno o pago aprobado de tipo CURSO
        $isEligibleByStatus = $student->status === StudentStatus::ELEGIBLE_INSCRIPCION;

        $hasApprovedCoursePayment = $student->services()
            ->where('status', ServiceStatus::APPROVED->value)
            ->where('type', ServiceType::CURSO->value)
            ->exists();

        if (! $isEligibleByStatus && ! $hasApprovedCoursePayment) {
            return back()->with('warning', 'No eres elegible para inscribirte: faltan pagos aprobados o autorización.');
        }

        // Si el alumno ya está inscrito en otro(s) grupo(s), darlo de baja primero
        $currentGroupIds = $student->qualifications()->pluck('group_id')->filter(fn($id) => $id !== $group->id)->unique()->values()->all();

        foreach ($currentGroupIds as $oldGroupId) {
            $oldGroup = \App\Models\Group::find($oldGroupId);
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
