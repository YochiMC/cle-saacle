<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkDeleteExamsRequest;
use App\Http\Requests\BulkUpdateExamsStatusRequest;
use App\Models\Exam;
use App\Services\ExamNamingService;
use Illuminate\Http\Request;

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
        // Alumnos inscritos (Traemos el pivot implícitamente por BelongsToMany)
        $students = $exam->students()->get();

        $enrolledStudents = $students->map(function ($student) {
            return new \App\Http\Resources\StudentExamResource($student);
        });

        // Alumnos disponibles
        $enrolledIds = $exam->students()->pluck('students.id');
        $availableStudents = \App\Models\Student::whereNotIn('id', $enrolledIds)
            ->select('id', 'first_name', 'last_name', 'num_control')
            ->get();

        return \Inertia\Inertia::render('Test_Vik/ExamView', [
            'examen'            => $exam,
            'enrolledStudents'  => $enrolledStudents,
            'availableStudents' => $availableStudents,
        ]);
    }

    public function enroll(Request $request, Exam $exam)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id'
        ]);

        $exam->students()->syncWithoutDetaching($request->student_ids);

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

    public function updatePivot(Request $request, Exam $exam)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'calificacion' => 'nullable|numeric|min:0|max:100'
        ]);

        $exam->students()->updateExistingPivot($request->student_id, [
            'calificacion' => $request->calificacion
        ]);

        return redirect()->back()->with('success', 'Calificación actualizada.');
    }

    public function bulkUpdatePivot(Request $request, Exam $exam)
    {
        $request->validate([
            'qualifications' => 'required|array',
            'qualifications.*.id' => 'required|exists:students,id',
            'qualifications.*.calificacion' => 'nullable|numeric|min:0|max:100'
        ]);

        foreach ($request->qualifications as $q) {
            $exam->students()->updateExistingPivot($q['id'], [
                'calificacion' => $q['calificacion'] ?? null
            ]);
        }

        return redirect()->back()->with('success', 'Calificaciones guardadas masivamente.');
    }
}
