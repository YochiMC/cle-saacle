<?php

namespace App\Http\Controllers;

use App\Actions\BulkUpdateExamQualifications;
use App\Actions\EnrollStudentsInExam;
use App\Actions\AutoQueueAccreditationCandidates;
use App\Actions\BulkDeleteExams;
use App\Actions\BulkUpdateExamStatus;
use App\Actions\BulkDetachStudentsFromExam;
use App\Enums\AcademicStatus;
use App\Http\Requests\BulkDeleteExamsRequest;
use App\Http\Requests\BulkUnenrollRequest;
use App\Http\Requests\BulkUpdateExamStatusRequest;
use App\Http\Requests\EnrollStudentsRequest;
use App\Http\Requests\BulkUpdateExamQualificationsRequest;
use App\Http\Requests\StoreExamRequest;
use App\Http\Requests\UpdateExamPivotRequest;
use App\Models\Exam;
use App\Models\Student;
use App\Services\ExamNamingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Thin Controller para la Gestión de Exámenes Académicos.
 *
 * Aplica estrictamente el Principio de Responsabilidad Única (SRP):
 * - Las validaciones están aisladas en FormRequests.
 * - La lógica de negocio (inscripción, bulk update de pivot) está en Actions.
 * - El controlador solo orquesta: recibe, delega y redirige.
 */
class ExamController extends Controller
{
    public function __construct(private ExamNamingService $namingService) {}

    /**
     * Crea un nuevo examen.
     */
    public function store(StoreExamRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['name'] = $this->namingService->generateName($validated);

        Exam::create($validated);

        return redirect()->back()->with('success', 'Examen agregado correctamente.');
    }

    /**
     * Actualiza un examen existente.
     */
    public function update(
        StoreExamRequest $request, 
        Exam $exam,
        \App\Actions\ResetModelQualifications $resetAction
    ): RedirectResponse {
        $validated = $request->validated();
        $validated['name'] = $this->namingService->generateName($validated);

        if (isset($validated['exam_type']) && $validated['exam_type'] !== $exam->exam_type->value) {
            $resetAction->execute($exam);
        }

        $exam->update($validated);

        return redirect()->back()->with('success', 'Examen actualizado correctamente.');
    }

    /**
     * Elimina un examen.
     */
    public function destroy(Exam $exam): RedirectResponse
    {
        $exam->delete();

        return redirect()->back()->with('success', 'Examen eliminado correctamente.');
    }

    /**
     * Muestra el dashboard de un examen con sus alumnos inscritos y calificaciones.
     */
    public function show(Exam $exam)
    {
        $students = $exam->students()->get();

        $enrolledStudents = $students->map(
            fn($student) => new \App\Http\Resources\StudentExamQualificationResource($student)
        );

        $enrolledIds = $exam->students()->pluck('students.id');
        $availableStudents = \App\Models\Student::whereNotIn('id', $enrolledIds)
            ->select('id', 'first_name', 'last_name', 'num_control')
            ->get();

        $levelsTecnm = \App\Models\Level::where('level_tecnm', '!=', 'Programa Egresados')
            ->pluck('level_tecnm')
            ->unique()
            ->values();

        return \Inertia\Inertia::render('Exams/View', [
            'examen'           => $exam,
            'enrolledStudents' => $enrolledStudents,
            'availableStudents' => $availableStudents,
            'levelsTecnm'      => $levelsTecnm,
        ]);
    }

    /**
     * Inscribe alumnos en el examen.
     *
     * Toda la lógica (schema inicial desde ExamType, anti-duplicados, transacción)
     * está encapsulada en EnrollStudentsInExam.
     */
    public function enroll(EnrollStudentsRequest $request, Exam $exam, EnrollStudentsInExam $action): RedirectResponse
    {
        $action->execute($exam, $request->validated('student_ids'));

        return redirect()->back()->with('success', 'Alumnos inscritos al examen.');
    }

    /**
     * Da de baja a un solo alumno del examen.
     */
    public function unenroll(Exam $exam, Student $student): RedirectResponse
    {
        $exam->students()->detach($student->id);

        return redirect()->back()->with('success', 'Alumno dado de baja del examen.');
    }

    /**
     * Da de baja masiva de alumnos del examen delegada a la capa de Acción.
     */
    public function bulkUnenroll(BulkUnenrollRequest $request, Exam $exam, BulkDetachStudentsFromExam $action): RedirectResponse
    {
        $action->execute($exam, $request->validated('ids'));

        return redirect()->back()->with('success', 'Alumnos seleccionados desmatriculados correctamente.');
    }

    /**
     * Actualización masiva del estado de múltiples exámenes delegada a la capa de Acción.
     */
    public function bulkStatus(BulkUpdateExamStatusRequest $request, BulkUpdateExamStatus $action): RedirectResponse
    {
        $action->execute(
            $request->validated('ids'),
            $request->validated('new_status')
        );

        return redirect()->back()->with('success', 'Estados de exámenes actualizados exitosamente.');
    }

    /**
     * Eliminación masiva de exámenes delegada a la capa de Acción.
     */
    public function bulkDelete(BulkDeleteExamsRequest $request, BulkDeleteExams $action): RedirectResponse
    {
        $action->execute($request->validated('ids'));

        return redirect()->back()->with('success', 'Exámenes eliminados correctamente.');
    }

    /**
     * Actualiza la calificación individual de un alumno en el pivot.
     */
    public function updatePivot(UpdateExamPivotRequest $request, Exam $exam, Student $student): RedirectResponse
    {
        $exam->students()->updateExistingPivot($student->id, [
            'units_breakdown' => $request->validated('units_breakdown'),
            'final_average'   => $request->validated('final_average') ?? 0,
        ]);

        return redirect()->back()->with('success', 'La calificación del alumno ha sido guardada correctamente.');
    }

    /**
     * Actualiza masivamente las calificaciones del pivot exam_student.
     *
     * La transacción y el loop de actualización están encapsulados en
     * BulkUpdateExamQualifications.
     */
    public function bulkUpdatePivot(BulkUpdateExamQualificationsRequest $request, Exam $exam, BulkUpdateExamQualifications $action): RedirectResponse
    {
        $action->execute($exam, $request->validated('qualifications'));

        return redirect()->back()->with('success', '¡Éxito! Las calificaciones de todos los alumnos han sido guardadas y calculadas correctamente.');
    }

    /**
     * Cierra definitivamente un examen.
     */
    public function complete(Exam $exam, AutoQueueAccreditationCandidates $action): RedirectResponse
    {
        $exam->update(['status' => AcademicStatus::COMPLETED]);

        // Automatización del flujo de acreditación
        $action->executeForExam($exam);

        return redirect()->back()->with('success', 'El examen ha sido cerrado exitosamente. Ya no se permiten modificaciones.');
    }
}
