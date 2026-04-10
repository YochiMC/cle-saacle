<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkDeleteExamsRequest;
use App\Http\Requests\BulkUpdateExamsStatusRequest;
use App\Http\Requests\BulkUpdateExamQualificationsRequest;
use App\Http\Requests\EnrollStudentsRequest;
use App\Enums\AcademicStatus;
use App\Models\Exam;
use App\Models\ExamStudent;
use App\Models\Student;
use App\Services\ExamNamingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    private ExamNamingService $namingService;

    public function __construct(ExamNamingService $namingService)
    {
        $this->namingService = $namingService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'exam_type' => 'required|string',
            'status' => 'required|string',
            'capacity' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'mode' => 'required|string',
            'application_time' => 'nullable|string',
            'classroom' => 'nullable|string|max:255',
            'period_id' => 'required|exists:periods,id',
            'teacher_id' => 'nullable|integer|exists:teachers,id',
        ]);

        $validated['name'] = $this->namingService->generateName($validated);

        Exam::create($validated);

        return redirect()->back()->with('success', 'Examen agregado correctamente.');
    }

    public function update(Request $request, Exam $exam)
    {
        $validated = $request->validate([
            'exam_type' => 'required|string',
            'status' => 'required|string',
            'capacity' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'mode' => 'required|string',
            'application_time' => 'nullable|string',
            'classroom' => 'nullable|string|max:255',
            'period_id' => 'required|exists:periods,id',
            'teacher_id' => 'nullable|integer|exists:teachers,id',
        ]);

        $validated['name'] = $this->namingService->generateName($validated);

        $exam->update($validated);

        return redirect()->back()->with('success', 'Examen actualizado correctamente.');
    }

    public function destroy(Exam $exam)
    {
        $exam->delete();

        return redirect()->back()->with('success', 'Examen eliminado correctamente.');
    }

    public function show(Exam $exam)
    {
        // Cargamos alumnos con los datos completos del pivot (incluyendo units_breakdown).
        $students = $exam->students()->get();

        $enrolledStudents = $students->map(
            fn($student) => new \App\Http\Resources\StudentExamQualificationResource($student)
        );

        // Alumnos disponibles para inscripción
        $enrolledIds = $exam->students()->pluck('students.id');
        $availableStudents = \App\Models\Student::whereNotIn('id', $enrolledIds)
            ->select('id', 'first_name', 'last_name', 'num_control')
            ->get();

        $levelsTecnm = \App\Models\Level::where('level_tecnm', '!=', 'Programa Egresados')
            ->pluck('level_tecnm')
            ->unique()
            ->values();

        return \Inertia\Inertia::render('Exams/ExamView', [
            'examen'            => $exam,
            'enrolledStudents'  => $enrolledStudents,
            'availableStudents' => $availableStudents,
            'levelsTecnm'       => $levelsTecnm,
        ]);
    }

    public function enroll(EnrollStudentsRequest $request, Exam $exam)
    {
        // Genera el JSON inicial según las reglas de negocio del ExamType.
        $defaultBreakdown = $exam->exam_type->defaultUnitsBreakdown();

        DB::transaction(function () use ($request, $exam, $defaultBreakdown) {
            foreach ($request->validated('student_ids') as $studentId) {
                // Usamos attach() en lugar de syncWithoutDetaching() para poder
                // pasar los datos de pivot (units_breakdown) inicializados correctamente.
                if (!$exam->students()->where('students.id', $studentId)->exists()) {
                    $exam->students()->attach($studentId, [
                        'units_breakdown' => json_encode($defaultBreakdown),
                        'final_average'   => 0,
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Alumnos inscritos al examen.');
    }

    public function unenroll(Exam $exam, \App\Models\Student $student)
    {
        $exam->students()->detach($student->id);
        return redirect()->back()->with('success', 'Alumno dado de baja del examen.');
    }

    public function bulkUnenroll(Request $request, Exam $exam)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:students,id'
        ]);

        $exam->students()->detach($request->ids);
        return redirect()->back()->with('success', 'Alumnos seleccionados dados de baja.');
    }

    public function bulkStatus(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:exams,id',
            'status' => 'required|string', // Wait, the frontend sends new_status. I'll support both to not break.
        ]);

        $newStatus = $request->input('new_status', $request->input('status'));

        Exam::whereIn('id', $validated['ids'])
            ->update(['status' => $newStatus]);

        return redirect()->back()->with('success', 'Estados de exámenes actualizados exitosamente.');
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:exams,id',
        ]);

        Exam::whereIn('id', $validated['ids'])->delete();

        return redirect()->back()->with('success', 'Exámenes eliminados correctamente.');
    }

    public function updatePivot(Request $request, Exam $exam, Student $student)
    {
        $validated = $request->validate([
            'units_breakdown' => 'required|array',
            'final_average' => 'nullable|numeric'
        ]);

        $exam->students()->updateExistingPivot($student->id, [
            'units_breakdown' => $validated['units_breakdown'],
            'final_average' => $validated['final_average'] ?? 0,
        ]);

        return redirect()->back()->with('success', 'La calificación del alumno ha sido guardada correctamente.');
    }

    public function bulkUpdatePivot(BulkUpdateExamQualificationsRequest $request, Exam $exam)
    {
        DB::transaction(function () use ($request, $exam) {
            foreach ($request->validated('qualifications') as $q) {
                $exam->students()->updateExistingPivot($q['student_id'], [
                    'units_breakdown' => $q['units_breakdown'],
                    'final_average' => $q['final_average'] ?? 0,
                ]);
            }
        });

        return redirect()->back()->with('success', '¡Éxito! Las calificaciones de todos los alumnos han sido guardadas y calculadas correctamente.');
    }

    public function complete(Exam $exam)
    {
        $exam->update(['status' => AcademicStatus::COMPLETED]);

        return redirect()->back()->with('success', 'El examen ha sido cerrado exitosamente. Ya no se permiten modificaciones.');
    }
}
