<?php

namespace App\Http\Controllers;

use App\Actions\CreateStudentWithUser;
use App\Actions\DeleteStudentWithUser;
use App\Actions\UpdateStudentWithUser;
use App\Actions\BulkDeleteUser;
use App\Http\Requests\BulkDeleteStudentsRequest;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;

class StudentController extends Controller
{
    public function createStudent(
        StoreStudentRequest $request,
        CreateStudentWithUser $action
    ) {
        try {
            // 1. Ejecutamos la acción
            $action->execute($request->validated());

            return redirect()->back()->with('success', 'Estudiante creado correctamente.');

        } catch (\Exception $e) {
            // 2. Si la base de datos lanza un error, lo atrapamos y te lo mostramos
            // Usamos 'dd' (Dump and Die) para que la pantalla explote y te muestre el mensaje exacto
            dd('ERROR FATAL EN LA BASE DE DATOS:', $e->getMessage());
        }
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

    /**
     * Elimina masivamente alumnos y sus usuarios asociados.
     *
     * La lógica de borrado transaccional se delega a BulkDeleteUser.
     */
    public function bulkDeleteStudents(
        BulkDeleteStudentsRequest $request,
        BulkDeleteUser $action
    ) {
        $students = Student::with('user')
            ->whereIn('id', $request->validated('ids'))
            ->get();

        $users = $students
            ->pluck('user')
            ->filter()
            ->all();

        $action->execute($users);

        return redirect()->back()->with('success', 'Estudiantes eliminados correctamente.');
    }
}
