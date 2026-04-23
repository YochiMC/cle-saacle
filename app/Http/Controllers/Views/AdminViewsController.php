<?php

namespace App\Http\Controllers\Views;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\GroupMode;
use App\Enums\StudentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\GroupResource;
use App\Http\Resources\LevelResource;
use App\Http\Resources\StudentResource;
use App\Http\Resources\TeacherResource;
use App\Http\Resources\UserResource;
use App\Models\Degree;
use App\Models\Exam;
use App\Models\Group;
use App\Models\Level;
use App\Models\Period;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\TypeStudent;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

/**
 * Controlador para la gestión de las vistas administrativas.
 * Se encarga de preparar los datos y catálogos necesarios para las páginas de Inertia.
 */
class AdminViewsController extends Controller
{
    /**
     * Resuelve los tipos de documento visibles según el rol principal del usuario.
     * Mantiene el mismo contrato de datos usado en la vista administrativa del perfil.
     *
     * @return array<int, array{value: string, label: string}>
     */
    private function resolveDocumentTypeOptions(User $user): array
    {
        if ($user->hasRole('teacher')) {
            return DocumentType::requiredSelectFor('teacher');
        }

        if ($user->hasRole('student')) {
            return DocumentType::requiredSelectFor('student');
        }

        return DocumentType::toSelect();
    }

    /**
     * Renderiza la vista de gestión de usuarios (Alumnos y Docentes).
     *
     * Incluye el catálogo de estados de estudiante para que la UI use etiquetas
     * oficiales del enum y no dependa de strings hardcodeados.
     *
     * @return \Inertia\Response
     */
    public function usersView()
    {
        return Inertia::render('Users/Users', [
            'students' => StudentResource::collection(Student::with(['degree', 'level', 'typeStudent'])->get())->resolve(),
            'teachers' => TeacherResource::collection(Teacher::all())->resolve(),
            'degrees' => Degree::all(),
            'levels' => Level::all(),
            'typeStudents' => TypeStudent::all(),
            'studentStatuses' => array_map(fn ($status) => ['value' => $status->value, 'label' => $status->label()], StudentStatus::cases()),
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
        $user = $request->user();
        $esEstudiante = $user?->hasRole('student') ?? false;

        $grupos = Group::with(['teacher', 'level', 'period', 'qualifications.student'])
            ->withCount('qualifications')
            ->visibleToUser($user)
            ->get();
    
        // Regla para ocultar al docente (excelente práctica de seguridad que ya tenías)
        if ($esEstudiante && $this->debeOcultarDocentes()) {
            $grupos->each(fn ($g) => $g->setRelation('teacher', null));
        }

        return Inertia::render('Groups/Index', [
            'grupos' => GroupResource::collection($grupos)->resolve(),
            'levels' => LevelResource::collection(Level::orderBy('level_tecnm')->get())->resolve(),
            'teachers' => TeacherResource::collection(Teacher::all())->resolve(),
            'periods' => Period::all(),
            'statuses' => array_map(fn ($status) => ['value' => $status->value, 'label' => $status->label()], \App\Enums\AcademicStatus::cases()),
            'modes' => \App\Enums\GroupMode::getOptions(),
            'types' => \App\Enums\GroupType::getOptions(),
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

        $availableStudents = Student::whereDoesntHave('qualifications', function ($query) use ($id) {
            $query->where('group_id', $id);
        })->get();

        return Inertia::render('Groups/View', [
            'grupo' => $group,
            'teachers' => TeacherResource::collection(Teacher::all())->resolve(),
            'periods' => Period::all(['id', 'name']),
            'enrolledStudents' => $mockStudents,
            'availableStudents' => StudentResource::collection($availableStudents)->resolve(),
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
            'documents',
            'teacher',
            'student.degree',
            'student.level',
            'student.typeStudent',
        ]);

        $documentTypeOptions = $this->resolveDocumentTypeOptions($user);

        return Inertia::render('Profile/Users/Edit', [
            'roles' => Role::all(),
            'user' => UserResource::make($user),
            'hasStudent' => (bool) $user->student,
            'degrees' => Degree::all(['id', 'name']),
            'levels' => Level::all(['id', 'level_tecnm']),
            'typeStudents' => TypeStudent::all(['id', 'name']),
            'documentStatuses' => DocumentStatus::reviewOptions(),
            'documentTypes' => $documentTypeOptions,
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

        return Inertia::render('Academic/Reports', [
            'students' => $students,
            'teachers' => $teachers,
            'degrees' => $degrees,
            'levels' => $levels,
            'groups' => $groups,
            'typeStudents' => $type_students,
        ]);
    }

    public function examsView(Request $request)
    {
        $esEstudiante = $request->user()?->hasRole('student') ?? false;
        $ocultarDocentes = $esEstudiante && $this->debeOcultarDocentes();

        $exams = Exam::with(['students', 'teacher', 'period'])->get();

        // Aplanamos los datos y calculamos campos derivados para el frontend
        $examsData = $exams->map(function ($exam) use ($ocultarDocentes) {
            $enrolledCount = $exam->students->count();
            $availableSeats = max(0, ($exam->capacity ?? 0) - $enrolledCount);

            return [
                'id' => $exam->id,
                'name' => $exam->name,
                'exam_type' => $exam->exam_type?->value ?? $exam->exam_type,
                'capacity' => $exam->capacity,
                'start_date' => $exam->start_date,
                'end_date' => $exam->end_date,
                'mode' => $exam->mode,
                'application_time' => $exam->application_time,
                'classroom' => $exam->classroom,
                'status' => $exam->status?->value ?? $exam->status,
                'period_id' => $exam->period_id,
                'teacher_id' => $ocultarDocentes ? null : $exam->teacher_id,
                'teacher_name' => $ocultarDocentes ? 'Por asignar' : $exam->teacher?->full_name,
                'teacher' => $ocultarDocentes || ! $exam->teacher ? null : [
                    'name' => $exam->teacher->first_name,
                    'last_name' => $exam->teacher->last_name,
                ],
                'period_name' => $exam->period?->name,
                'period' => $exam->period ? ['id' => $exam->period->id, 'name' => $exam->period->name] : null,
                'registered' => $enrolledCount,
                'enrolled_count' => $enrolledCount,
                'available_seats' => $availableSeats,
                'students_string' => collect($exam->students)->map(fn ($s) => ($s->first_name ?? '').' '.($s->last_name ?? ''))->join(' '),
            ];
        });

        $teachers = Teacher::all();
        $periods = Period::all();

        return Inertia::render('Exams/Index', [
            'examenes' => $examsData,
            'teachers' => $teachers,
            'periods' => $periods,
            'statuses' => array_map(fn ($s) => ['value' => $s->value, 'label' => $s->label()], \App\Enums\AcademicStatus::cases()),
            'typeOptions' => \App\Enums\ExamType::getOptions(),
            'modeOptions' => GroupMode::getOptions(),
        ]);
    }
}
