<?php

namespace App\Http\Controllers;

use App\Actions\GetAccreditationCandidates;
use App\Actions\GetAccreditationMetadata;
use App\Actions\UpdateStudentAccreditationStatus;
use App\Actions\BulkSuspendStudents;
use App\Http\Requests\UpdateAccreditationStatusRequest;
use App\Http\Requests\BulkSuspendAccreditationRequest;
use App\Http\Resources\AccreditationCandidateResource;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador para la Gestión y Flujo de Acreditación de Alumnos.
 * 
 * Este controlador actúa como un orquestador ligero (Thin Controller),
 * delegando la validación a FormRequests y la lógica de negocio a Actions.
 */
class AccreditationController extends Controller
{
    /**
     * Muestra la vista de gestión de candidatos a acreditación.
     */
    public function index(
        Request $request, 
        GetAccreditationCandidates $candidatesAction,
        GetAccreditationMetadata $metadataAction
    ): Response {
        // Obtenemos los candidatos filtrándolos por estatus si se proporciona.
        $candidates = $candidatesAction->execute($request->query('status'));

        return Inertia::render('Accreditations/Index', [
            'candidates' => AccreditationCandidateResource::collection($candidates)->resolve(),
            'accreditationTypeOptions' => $metadataAction->execute(),
        ]);
    }

    /**
     * Actualiza el estatus de acreditación de un alumno de forma manual (React Inline Edit).
     */
    public function updateStatus(
        UpdateAccreditationStatusRequest $request, 
        Student $student,
        UpdateStudentAccreditationStatus $action
    ): RedirectResponse {
        $action->execute($student, $request->validated('status'));

        return redirect()->back()->with('success', 'El estatus del alumno ha sido actualizado correctamente.');
    }

    /**
     * Suspende masivamente a los alumnos seleccionados en el módulo.
     */
    public function bulkSuspend(
        BulkSuspendAccreditationRequest $request,
        BulkSuspendStudents $action
    ): RedirectResponse {
        $action->execute($request->validated('ids'));

        return redirect()->back()->with('success', 'Los alumnos seleccionados han sido actualizados al estatus "Suspendido".');
    }
}
