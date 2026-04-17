<?php

namespace App\Http\Controllers;

use App\Actions\BulkDeleteUser;
use App\Models\Teacher;
use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\BulkDeleteTeachersRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Actions\CreateTeacherWithUser;
use App\Actions\UpdateTeacherWithUser;
use App\Actions\DeleteTeacherWithUser;

class TeacherController extends Controller
{
    public function createTeacher(
        StoreTeacherRequest $request,
        CreateTeacherWithUser $action
    ) {
        $action->execute($request->validated());

        return redirect()->back()->with('success', 'Docente creado correctamente.');
    }

    public function updateTeacher(
        UpdateTeacherRequest $request,
        Teacher $teacher,
        UpdateTeacherWithUser $action
    ) {
        $action->execute($teacher, $request->validated());

        return redirect()->back()->with('success', 'Docente actualizado correctamente.');
    }

    public function deleteTeacher(
        Teacher $teacher,
        DeleteTeacherWithUser $action
    ) {
        $action->execute($teacher);

        return redirect()->back()->with('success', 'Docente eliminado correctamente.');
    }

    /**
     * Elimina masivamente docentes y sus usuarios asociados.
     *
     * La lógica de borrado transaccional se delega a BulkDeleteUser.
     */
    public function bulkDeleteTeachers(
        BulkDeleteTeachersRequest $request,
        BulkDeleteUser $action
    ) {
        $teachers = Teacher::with('user')
            ->whereIn('id', $request->validated('ids'))
            ->get();

        $users = $teachers
            ->pluck('user')
            ->filter()
            ->all();

        $action->execute($users);

        return redirect()->back()->with('success', 'Docentes eliminados correctamente.');
    }
}
