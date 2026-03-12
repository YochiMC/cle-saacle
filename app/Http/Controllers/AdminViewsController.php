<?php

namespace App\Http\Controllers;

use App\Models\Degree;
use App\Models\Group;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Level;
use App\Models\Setting;
use App\Http\Resources\GroupResource;
use App\Http\Resources\LevelResource;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controlador de Vistas Administrativas
 *
 * Principio SRP: Solo gestiona la presentación de la información para las vistas.
 * Las reglas de presentación de datos (ocultar docentes, filtrar estados por rol) 
 * se aplican aquí antes de despachar hacia Inertia.
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

    /**
     * Renderiza la vista del Catálogo de Grupos.
     * Aplica reglas de negocio basadas en el rol del usuario:
     * - Los estudiantes solo reciben grupos con estado 'active' o 'waiting'.
     * - Los estudiantes no pueden ver al docente asignado antes de la fecha de revelión estipulada.
     *
     * @param Request $request Petición entrante.
     * @return \Inertia\Response Render de la vista en Inertia con los datos.
     */
    public function groupsView(Request $request)
    {
        $usuarioEsEstudiante = $request->user()?->hasRole('student') ?? false;

        $gruposQuery = Group::with(['teacher', 'level', 'period']);
        
        if ($usuarioEsEstudiante) {
            $gruposQuery->whereIn('status', ['active', 'waiting']);
        }

        $grupos = $gruposQuery->get();

        $fechaRevelo = Setting::where('key', 'teacher_reveal_date')->value('value') 
            ? Carbon::parse(Setting::where('key', 'teacher_reveal_date')->value('value')) 
            : Carbon::parse('2026-03-20');

        if ($usuarioEsEstudiante && now()->lt($fechaRevelo)) {
            $grupos->each(function ($grupo) {
                $grupo->setRelation('teacher', null);
            });
        }

        $levels = Level::orderBy('level_tecnm')->get();

        return Inertia::render('Test_MK2/Groups', [
            'grupos' => GroupResource::collection($grupos)->resolve(),
            'levels' => LevelResource::collection($levels)->resolve(),
        ]);
    }
}
