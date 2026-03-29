<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkDeleteExamsRequest;
use App\Http\Requests\BulkUpdateExamsStatusRequest;
use App\Models\Exam;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'exam_type' => 'required|string',
            'capacity' => 'required|integer|min:1',
            'application_date' => 'required|date',
            'application_time' => 'nullable|date_format:H:i',
            'classroom' => 'nullable|string|max:255',
            'period_id' => 'required|integer|exists:periods,id',
            'teacher_id' => 'nullable|integer|exists:teachers,id',
        ]);

        Exam::create($validated);

        return redirect()->back()->with('success', 'Examen agregado correctamente.');
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

    public function bulkUpdateStatus(BulkUpdateExamsStatusRequest $request)
    {
        $validated = $request->validated();

        Exam::whereIn('id', $validated['ids'])
            ->update(['status' => $validated['new_status']]);

        return redirect()->back()->with('success', 'Estados de exámenes actualizados exitosamente.');
    }

    public function bulkDestroy(BulkDeleteExamsRequest $request)
    {
        $validated = $request->validated();

        Exam::whereIn('id', $validated['ids'])->delete();

        return redirect()->back()->with('success', 'Exámenes eliminados.');
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
