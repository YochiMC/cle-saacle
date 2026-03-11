<?php

namespace App\Http\Controllers;

use App\Models\Degree;
use App\Models\Group;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Level;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * AdminViewsController
 *
 * Principio SRP: solo gestiona la presentación de vistas administrativas.
 * La lógica de negocio (ocultar docente) está expresada aquí de forma
 * explícita, ya que es una regla de presentación de datos, no de dominio.
 */
class AdminViewsController extends Controller
{
    public function usersView()
    {
        $students = Student::all();
        $teachers = Teacher::all();
        $degrees = Degree::all();
        $levels = Level::all();
        return Inertia::render('TestYochi/Users', [
            'students' => $students,
            'teachers' => $teachers,
            'degrees' => $degrees,
            'levels' => $levels
        ]);
    }

    public function groupsView(Request $request)
    {
        // 1. Eager Loading: cargamos teacher, level y period
        $grupos = Group::with(['teacher', 'level', 'period'])->get();

        // 2. Blindaje: Safe Navigation Operator. Si el usuario es null, devuelve false.
        $usuarioEsEstudiante = $request->user()?->hasRole('student') ?? false;
        $fechaRevelo = Carbon::parse('2026-03-20');

        // 3. Regla de negocio: ocultar docente para estudiantes antes del 2026-03-20.
        if ($usuarioEsEstudiante && now()->lt($fechaRevelo)) {
            $grupos->each(function ($grupo) {
                $grupo->setRelation('teacher', null);
            });
        }

        return Inertia::render('Test_MK2/Groups', [
            'grupos' => $grupos,
        ]);
    }
}
