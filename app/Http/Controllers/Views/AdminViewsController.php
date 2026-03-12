<?php

namespace App\Http\Controllers\Views;

use App\Http\Controllers\Controller;
use App\Models\Degree;
use App\Models\Group;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Level;
use App\Models\Setting;
use App\Http\Resources\GroupResource;
use App\Http\Resources\LevelResource;
use App\Http\Resources\StudentResource;
use App\Http\Resources\TeacherResource;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\TypeStudent;
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
        $students = StudentResource::collection(Student::with(['degree', 'level', 'typeStudent'])->get())->resolve();
        $teachers = TeacherResource::collection(Teacher::all())->resolve();
        $degrees = Degree::all();
        $levels = Level::all();
        $type_students = TypeStudent::all();
        return Inertia::render('TestYochi/Users', [
            'students' => $students,
            'teachers' => $teachers,
            'degrees' => $degrees,
            'levels' => $levels,
            'typeStudents' => $type_students
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

        $gruposQuery = Group::with(['teacher', 'level', 'period'])->withCount('qualifications');
        
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
