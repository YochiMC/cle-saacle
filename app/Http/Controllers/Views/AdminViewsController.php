<?php

namespace App\Http\Controllers\Views;

use App\Http\Controllers\Controller;
use App\Http\Resources\GroupResource;
use App\Http\Resources\LevelResource;
use App\Http\Resources\StudentResource;
use App\Http\Resources\TeacherResource;
use App\Http\Resources\UserResource;
use App\Models\Degree;
use App\Models\Group;
use App\Models\Level;
use App\Models\Period;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\TypeStudent;
use App\Models\User;
use App\Models\Exam;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controlador para la gestión de las vistas administrativas.
 * Se encarga de preparar los datos y catálogos necesarios para las páginas de Inertia.
 */
class AdminViewsController extends Controller
{
    /**
     * Renderiza la vista de gestión de usuarios (Alumnos y Docentes).
     *
     * @return \Inertia\Response
     */
    public function usersView()
    {
        return Inertia::render('TestYochi/Users', [
            'students' => StudentResource::collection(Student::with(['degree', 'level', 'typeStudent'])->get())->resolve(),
            'teachers' => TeacherResource::collection(Teacher::all())->resolve(),
            'degrees' => Degree::all(),
            'levels' => Level::all(),
            'typeStudents' => TypeStudent::all(),
        ]);
    }

    /**
     * Renderiza el catálogo de grupos filtrado según el rol del usuario.
     * Implementa la regla de negocio de ocultar el nombre del docente según la fecha configurada.
     *
     * @return \Inertia\Response
     */
    public function groupsView(Request $request)
    {
        $esEstudiante = $request->user()?->hasRole('student') ?? false;

        $grupos = Group::with(['teacher', 'level', 'period'])
            ->withCount('qualifications')
            ->when($esEstudiante, fn ($q) => $q->whereIn('status', ['active', 'waiting']))
            ->get();

        if ($esEstudiante && $this->debeOcultarDocentes()) {
            $grupos->each(fn ($g) => $g->setRelation('teacher', null));
        }

        return Inertia::render('Test_MK2/Groups', [
            'grupos' => GroupResource::collection($grupos)->resolve(),
            'levels' => LevelResource::collection(Level::orderBy('level_tecnm')->get())->resolve(),
            'teachers' => TeacherResource::collection(Teacher::all())->resolve(),
            'periods' => Period::all(),
            'statuses' => array_map(fn ($status) => ['value' => $status->value, 'label' => $status->label()], \App\Enums\GroupStatus::cases()),
        ]);
    }

    /**
     * Muestra el detalle profundo (Dashboard) de un grupo específico.
     *
     * @param  int|string  $id  ID del grupo.
     * @return \Inertia\Response
     */
    public function showDetails($id)
    {
        $group = Group::with(['teacher', 'level', 'period', 'qualifications.student'])->findOrFail($id);

        // Mock de estudiantes inscritos para visualización de tabla (reutilizando ResourceDashboard)
        $mockStudents = [
            ['id' => 101, 'control_number' => '19000001', 'name' => 'Ana', 'last_name' => 'Pérez', 'status' => 'Activo'],
            ['id' => 102, 'control_number' => '19000002', 'name' => 'Luis', 'last_name' => 'García', 'status' => 'Activo'],
            ['id' => 103, 'control_number' => '19000003', 'name' => 'María', 'last_name' => 'López', 'status' => 'Inactivo'],
            ['id' => 104, 'control_number' => '19000004', 'name' => 'José', 'last_name' => 'Martínez', 'status' => 'Activo'],
            ['id' => 105, 'control_number' => '19000005', 'name' => 'Elena', 'last_name' => 'Rodríguez', 'status' => 'Activo'],
        ];

        return Inertia::render('Test_MK2/GroupView', [
            'grupo' => $group,
            'teachers' => TeacherResource::collection(Teacher::all())->resolve(),
            'periods' => Period::all(['id', 'name']),
            'enrolledStudents' => $mockStudents,
        ]);
    }

    /**
     * Determina si el nombre de los docentes debe permanecer oculto para los estudiantes.
     */
    private function debeOcultarDocentes(): bool
    {
        $fechaConfig = Setting::where('key', 'teacher_reveal_date')->value('value');
        $fechaRevelo = $fechaConfig ? Carbon::parse($fechaConfig) : Carbon::parse('2026-03-20');

        return now()->lt($fechaRevelo);
    }

    public function profilesView(User $user)
    {
        // Cargamos las relaciones necesarias para ambos tipos de perfil.
        // Para el estudiante, cargamos sus relaciones para que StudentResource
        // pueda resolver los IDs de los selects correctamente.
        $user->loadMissing([
            'teacher',
            'student.degree',
            'student.level',
            'student.typeStudent',
        ]);

        return Inertia::render('Profile/Users/Edit', [
            'user'         => UserResource::make($user),
            'degrees'      => Degree::all(['id', 'name']),
            'levels'       => Level::all(['id', 'level_tecnm']),
            'typeStudents' => TypeStudent::all(['id', 'name']),
        ]);
    }

    public function reportsView(Request $request)
    {
        $students = StudentResource::collection(Student::with(['degree', 'level', 'typeStudent'])->get())->resolve();
        $teachers = TeacherResource::collection(Teacher::all())->resolve();
        $degrees = Degree::all();
        $levels = Level::all();
        $type_students = TypeStudent::all();
        $groups = Group::all();
        return Inertia::render('Test_Vik/Reports', [
            'students' => $students,
            'teachers' => $teachers,
            'degrees' => $degrees,
            'levels' => $levels,
            'groups' => $groups,
            'typeStudents' => $type_students
        ]);
    }

    public function examsView(Request $request)
    {
        $exams = Exam::with('student')->get(); // Opcional, si tienes relación definida (para mostrar nombre)
        $levels = Level::all();
        $teachers = Teacher::all();
        $periods = Period::all();
        $students = StudentResource::collection(Student::all())->resolve();

        return Inertia::render('Test_Vik/Examen', [
            'examenes' => $exams,
            'levels' => $levels,
            'teachers' => $teachers,
            'periods' => $periods,
            'students' => $students


        ]);
    }
}

