<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Actions\CreateStudentWithUser;
use App\Actions\UpdateStudentWithUser;
use App\Actions\DeleteStudentWithUser;

class StudentController extends Controller
{
    public function createStudent(
        StoreStudentRequest $request,
        CreateStudentWithUser $action
    ) {
        $action->execute($request->validated());

        return redirect()->back()->with('success', 'Estudiante creado correctamente.');
    }

    public function updateStudent(
        UpdateStudentRequest $request,
        Student $student,
        UpdateStudentWithUser $action
    ) {
        $action->execute($student, $request->validated());

        return redirect()->back()->with('success', 'Estudiante actualizado correctamente.');
    }

    public function deleteStudent(
        Student $student,
        DeleteStudentWithUser $action
    ) {
        $action->execute($student);

        return redirect()->back()->with('success', 'Estudiante eliminado correctamente.');
    }
}
