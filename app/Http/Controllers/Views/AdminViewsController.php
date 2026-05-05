<?php

namespace App\Http\Controllers\Views;

use App\Enums\AcademicStatus;
use App\Enums\GroupType;
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
        $ocultarDocentes = $esEstudiante && $this->debeOcultarDocentes();

        $grupos = Group::with(['teacher', 'level', 'period', 'qualifications.student'])
            ->withCount('qualifications')
            ->visibleToUser($user)
            ->get();

        // Regla para ocultar al docente (excelente práctica de seguridad que ya tenías)
        if ($ocultarDocentes) {
            $grupos->each(fn ($g) => $g->setRelation('teacher', null));
        }

        return Inertia::render('Groups/Index', [
            'grupos' => GroupResource::collection($grupos)->resolve(),
            'levels' => LevelResource::collection(Level::all()->sortBy('level_tecnm')->values())->resolve(),
            'teachers' => $ocultarDocentes ? [] : TeacherResource::collection(Teacher::all())->resolve(),
            'periods' => Period::all(),
            'statuses' => array_map(fn ($status) => ['value' => $status->value, 'label' => $status->label()], \App\Enums\AcademicStatus::cases()),
            'modes' => \App\Enums\GroupMode::getOptions(),
            'types' => \App\Enums\GroupType::getOptions(),
        ]);
    }

    /**
     * Determina si el nombre de los docentes debe permanecer oculto para los estudiantes.
     */
    private function debeOcultarDocentes(): bool
    {
        $fechaConfig = Setting::all()->firstWhere('key', 'teacher_reveal_date')?->value;
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
        $user = $request->user();
        $esEstudiante = $user?->hasRole('student') ?? false;
        $ocultarDocentes = $esEstudiante && $this->debeOcultarDocentes();

        $exams = Exam::with(['students', 'teacher', 'period'])
            ->visibleToUser($user)
            ->get();

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

        $teachers = $ocultarDocentes ? [] : Teacher::all();
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

    /**
     * Renderiza el catálogo de servicios/pagos filtrado según el rol del usuario.
     * Implementa el flujo de carga y revisión de comprobantes de pago.
     *
     * @return \Inertia\Response
     */
    public function servicesView(Request $request)
    {
        $user = $request->user();

        $services = \App\Models\Service::with('student.user')
            ->visibleToUser($user)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Academic/Pagos', [
            'services' => $services,
            'serviceTypes' => \App\Enums\ServiceType::toSelect(),
            'serviceStatuses' => \App\Enums\ServiceStatus::toSelect(),
            'reviewOptions' => \App\Enums\ServiceStatus::reviewOptions(),
        ]);
    }

    /**
     * Renderiza la vista de autoinscripción para estudiantes.
     * Muestra grupos disponibles dentro del período de inscripción actual.
     * Valida que el estudiante sea elegible antes de permitir la inscripción.
     *
     * @return \Inertia\Response
     */
    public function studentEnrollmentView(Request $request)
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return back()->with('error', 'No eres un estudiante registrado en el sistema.');
        }

        $student->loadMissing(['services', 'qualifications', 'exams']);

        // Preferir un periodo activo que cubra la fecha actual. Si no existe,
        // devolver el periodo activo más reciente por `start_date`.
        $today = now()->startOfDay();

        $activePeriod = Period::query()
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->orderByDesc('start_date')
            ->first()
            ?? Period::query()->where('is_active', true)->orderByDesc('start_date')->first();

        $approvedCourseTypes = $student->approvedCourseTypeValues();
        $approvedExamTypes = $student->approvedExamTypeValues();

        // Grupos y exámenes disponibles en el período activo, filtrados por el concepto pagado.
        $availableGroups = [];
        $availableExams = [];
        // Considerar estados que implican elegibilidad para inscribirse.
        // Algunos flujos marcan al estudiante como VALIDATED (validado para inscripción)
        // antes de cambiar a ELEGIBLE_INSCRIPCION, por lo que ambos deben permitir la inscripción.
        $isEligible = in_array($student->status, [StudentStatus::ELEGIBLE_INSCRIPCION, StudentStatus::VALIDATED], true);

        // Aseguramos que la comparación considere todo el día del inicio y fin
        // ya que Period castea las fechas como 'date' (00:00:00), lo que podía
        // provocar que now() quedara fuera si era el mismo día pero con hora > 00:00.
        $isInPeriod = false;
        if ($activePeriod && $activePeriod->start_date && $activePeriod->end_date) {
            $start = Carbon::parse($activePeriod->start_date)->startOfDay();
            $end = Carbon::parse($activePeriod->end_date)->endOfDay();
            $isInPeriod = now()->between($start, $end);
        }

        if ($isInPeriod && $activePeriod) {
            $grupos = Group::with(['level', 'teacher', 'period', 'qualifications'])
                ->where('period_id', $activePeriod->id)
                ->where('status', AcademicStatus::ENROLLING->value)
                ->get();

            // Calcular capacidad disponible y filtrar grupos no inscritos
            $availableGroups = $grupos
                ->filter(function ($group) use ($student, $approvedCourseTypes) {
                    if ($group->qualifications->contains('student_id', $student->id)) {
                        return false;
                    }

                    $groupType = $group->type?->value ?? $group->type;

                    if (!in_array($groupType, $approvedCourseTypes, true)) {
                        return false;
                    }

                    if ($groupType === GroupType::REGULAR->value) {
                        return (int) $group->level_id === (int) $student->level_id;
                    }

                    return true;
                })
                ->map(function ($group) {
                    $enrolled = $group->qualifications->count();
                    $capacity = $group->capacity ?? 0;
                    $available = max(0, $capacity - $enrolled);

                    return [
                        'id' => $group->id,
                        'name' => $group->name,
                        'level' => $group->level ? [
                            'id' => $group->level->id,
                            'name' => $group->level->name,
                            'level_tecnm' => $group->level->level_tecnm,
                        ] : null,
                        'teacher' => $group->teacher ? ['id' => $group->teacher->id, 'name' => $group->teacher->full_name] : null,
                        'period' => $group->period ? ['id' => $group->period->id, 'name' => $group->period->name] : null,
                        'type' => $group->type?->value ?? $group->type,
                        'capacity' => $capacity,
                        'enrolled' => $enrolled,
                        'available' => $available,
                        'schedule' => $group->schedule,
                        'classroom' => $group->classroom,
                    ];
                })
                ->groupBy('level.id')
                ->map(fn ($groups) => [
                    'level' => $groups->first()['level'],
                    'groups' => $groups->values()->all(),
                ])
                ->values()
                ->all();

            $exams = Exam::with(['teacher', 'period', 'students'])
                ->where('period_id', $activePeriod->id)
                ->where('status', AcademicStatus::ENROLLING->value)
                ->get();

            $availableExams = $exams
                ->filter(function ($exam) use ($student, $approvedExamTypes) {
                    if ($exam->students->contains('id', $student->id)) {
                        return false;
                    }

                    $examType = $exam->exam_type?->value ?? $exam->exam_type;

                    return in_array($examType, $approvedExamTypes, true);
                })
                ->map(function ($exam) {
                    $enrolled = $exam->students->count();
                    $capacity = $exam->capacity ?? 0;
                    $available = max(0, $capacity - $enrolled);

                    return [
                        'id' => $exam->id,
                        'name' => $exam->name,
                        'exam_type' => $exam->exam_type?->value ?? $exam->exam_type,
                        'capacity' => $capacity,
                        'enrolled' => $enrolled,
                        'available' => $available,
                        'start_date' => $exam->start_date,
                        'end_date' => $exam->end_date,
                        'application_time' => $exam->application_time,
                        'mode' => $exam->mode?->value ?? $exam->mode,
                        'classroom' => $exam->classroom,
                        'teacher' => $exam->teacher ? ['id' => $exam->teacher->id, 'name' => $exam->teacher->full_name] : null,
                        'period' => $exam->period ? ['id' => $exam->period->id, 'name' => $exam->period->name] : null,
                    ];
                })
                ->values()
                ->all();
        }

        return Inertia::render('Academic/StudentEnrollment', [
            'student' => $student,
            'activePeriod' => $activePeriod,
            'isEligible' => $isEligible,
            'isInPeriod' => $isInPeriod,
            'availableGroups' => $availableGroups,
            'availableExams' => $availableExams,
            'studentStatus' => $student->status->label(),
        ]);
    }
}
