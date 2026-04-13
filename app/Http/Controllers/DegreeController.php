<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Degree;
use App\Models\Student;
use App\Models\Teacher;
use Inertia\Inertia;

/**
 * Controlador de Carreras / Programas Académicos.
 *
 * getDegree() tiene ruta activa (GET /Test → RecursosYochi/Test, zona de sandbox).
 * Los demás métodos están pendientes de integración.
 */
class DegreeController extends Controller
{
    /**
     * @todo Sin ruta activa. Extraer validación a StoreDegreeRequest antes de conectar.
     *       Nota: la regla unique:degrees,name fallará al editar sin excluir el ID actual.
     */
    public function createDegree(Request $request): void
    {
        $validate = $request->validate([
            'name'       => 'required|string|max:100|unique:degrees,name',
            'curriculum' => 'required|string|max:30|unique:degrees,curriculum',
        ]);
        $degree = Degree::create($validate);
    }

    /**
     * Renderiza la vista de sandbox RecursosYochi/Test con catálogos base.
     * Ruta activa: GET /Test
     */
    public function getDegree()
    {
        $degrees  = Degree::all();
        $students = Student::all();
        $teachers = Teacher::all();

        return Inertia::render('RecursosYochi/Test', [
            'degrees'  => $degrees,
            'students' => $students,
            'teachers' => $teachers,
        ]);
    }

    /**
     * @todo Sin ruta activa. Extraer validación a UpdateDegreeRequest antes de conectar.
     *       La regla unique debe excluir el ID actual: unique:degrees,name,{id}.
     */
    public function updateDegree(Degree $degree, Request $request): void
    {
        $validate = $request->validate([
            'name'       => 'required|string|max:100|unique:degrees,name',
            'curriculum' => 'required|string|max:30|unique:degrees,curriculum',
        ]);
        $degree->update($validate);
    }

    /**
     * @todo Sin ruta activa.
     */
    public function deleteDegree(Degree $degree): void
    {
        $degree->delete();
    }
}
