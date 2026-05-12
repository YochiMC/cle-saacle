<?php

namespace App\Http\Controllers\Views;

use App\Enums\AcademicStatus;
use App\Enums\GroupType;
use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\GroupMode;
use App\Enums\StudentStatus;
use App\Enums\TypeStudent;
use App\Actions\Students\GetStudentKardexAction;
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
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\EnrollmentWindowResolver;
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
     * Incluye los catálogos de estados de estudiante y tipos de estudiante para que la UI
     * use etiquetas oficiales de los enums y no dependa de strings hardcodeados.
     *
     * @return \Inertia\Response
     */
    public function usersView()
    {
        return Inertia::render('Users/Users', [
            'students' => StudentResource::collection(Student::with(['degree', 'level'])->get())->resolve(),
            'teachers' => TeacherResource::collection(Teacher::all())->resolve(),
            'degrees' => Degree::all(),
            'levels' => Level::all(),
            'typeStudents' => TypeStudent::getOptions(),
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
        $currentStudentId = $user?->student?->id;

        $grupos = Group::with(['teacher', 'level', 'period', 'qualifications.student'])
            ->withCount('qualifications')
            ->visibleToUser($user)
            ->get();

        // Regla para ocultar al docente (excelente práctica de seguridad que ya tenías)
        if ($ocultarDocentes) {
            $grupos->each(fn ($g) => $g->setRelation('teacher', null));
        }

        return Inertia::render('Groups/Index', [
            'grupos' => GroupResource::collection($grupos->map(function ($group) use ($currentStudentId) {
                $group->setAttribute('is_enrolled', $currentStudentId
                    ? $group->qualifications->contains('student_id', $currentStudentId)
                    : false);

                return $group;
            }))->resolve(),
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
        // pueda resolver los valores de los selects correctamente.
        $user->loadMissing([
            'documents',
            'teacher',
            'student.degree',
            'student.level',
        ]);

        $documentTypeOptions = $this->resolveDocumentTypeOptions($user);

        return Inertia::render('Profile/Users/Edit', [
            'roles' => Role::all(),
            'user' => UserResource::make($user),
            'hasStudent' => (bool) $user->student,
            'degrees' => Degree::all(['id', 'name']),
            'levels' => Level::all(['id', 'level_tecnm']),
            'typeStudents' => TypeStudent::getOptions(),
            'documentStatuses' => DocumentStatus::reviewOptions(),
            'documentTypes' => $documentTypeOptions,
        ]);
    }

    public function reportsView(Request $request)
    {
        $students = StudentResource::collection(Student::with(['degree', 'level'])->get())->resolve();
        $teachers = TeacherResource::collection(Teacher::all())->resolve();
        $degrees = Degree::all();
        $levels = Level::all();
        $type_students = TypeStudent::getOptions();
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
        $currentStudentId = $user?->student?->id;

        $exams = Exam::with(['students', 'teacher', 'period'])
            ->visibleToUser($user)
            ->get();

        // Aplanamos los datos y calculamos campos derivados para el frontend
        $examsData = $exams->map(function ($exam) use ($ocultarDocentes, $currentStudentId) {
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
                'site' => $exam->site,
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
                'is_enrolled' => $currentStudentId
                    ? $exam->students->contains('id', $currentStudentId)
                    : false,
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
    public function studentEnrollmentView(Request $request, EnrollmentWindowResolver $windowResolver)
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return back()->with('error', 'No eres un estudiante registrado en el sistema.');
        }

        // Cargar qualifications con la relación `group` para mostrar las inscripciones actuales en la UI
        $student->loadMissing(['services', 'qualifications.group.teacher', 'qualifications.group.period', 'exams.teacher', 'exams.period']);

        $enrolledGroupIds = $student->qualifications
            ->pluck('group_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $enrolledGroups = empty($enrolledGroupIds)
            ? collect()
            : Group::with(['teacher', 'period'])
                ->withCount('qualifications')
                ->whereIn('id', $enrolledGroupIds)
                ->get();

        $enrolledExamIds = $student->exams
            ->pluck('id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $enrolledExams = empty($enrolledExamIds)
            ? collect()
            : Exam::with(['teacher', 'period'])
                ->withCount('students')
                ->whereIn('id', $enrolledExamIds)
                ->get();

        $activePeriod = $windowResolver->resolveActivePeriod();

        $approvedCourseTypes = $student->approvedCourseTypeValues();
        $approvedExamTypes = $student->approvedExamTypeValues();

        // Grupos y exámenes disponibles en el período activo, filtrados por el concepto pagado.
        $availableGroups = [];
        $availableExams = [];
        // Considerar estados que implican elegibilidad para inscribirse.
        // Algunos flujos marcan al estudiante como VALIDATED (validado para inscripción)
        // antes de cambiar a ELEGIBLE_INSCRIPCION, por lo que ambos deben permitir la inscripción.
        $studentStatus = $student->status;
        $isEligible = $studentStatus?->canAccessEnrollmentCatalog() ?? false;

        $isInPeriod = $windowResolver->isOpen($activePeriod);
        $canEnroll = $isEligible && $isInPeriod;

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
                        'site' => $exam->site,
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
            'enrolledGroups' => $enrolledGroups->map(function ($group) {
                $enrolled = (int) ($group->qualifications_count ?? 0);
                $capacity = (int) ($group->capacity ?? 0);

                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'type' => $group->type?->value ?? $group->type,
                    'teacher' => $group->teacher ? ['id' => $group->teacher->id, 'name' => $group->teacher->full_name] : null,
                    'capacity' => $capacity,
                    'enrolled' => $enrolled,
                    'available' => max(0, $capacity - $enrolled),
                    'schedule' => $group->schedule,
                    'classroom' => $group->classroom,
                ];
            })->all(),
            'enrolledExams' => $enrolledExams->map(function ($exam) {
                $enrolled = (int) ($exam->students_count ?? 0);
                $capacity = (int) ($exam->capacity ?? 0);

                return [
                    'id' => $exam->id,
                    'name' => $exam->name,
                    'exam_type' => $exam->exam_type?->value ?? $exam->exam_type,
                    'teacher' => $exam->teacher ? ['id' => $exam->teacher->id, 'name' => $exam->teacher->full_name] : null,
                    'capacity' => $capacity,
                    'enrolled' => $enrolled,
                    'available' => max(0, $capacity - $enrolled),
                    'application_time' => $exam->application_time,
                    'mode' => $exam->mode?->value ?? $exam->mode,
                    'site' => $exam->site,
                ];
            })->all(),
            'studentStatus' => $studentStatus?->label(),
            'studentStatusValue' => $studentStatus?->value,
            'canEnroll' => $canEnroll,
        ]);
    }

    /**
     * Renderiza el Kardex de calificaciones (Grupos y Exámenes) de un estudiante.
     *
     * Regla de autorización:
     * - El estudiante puede consultar su propio Kardex.
     * - Los coordinadores pueden consultar el Kardex de cualquier estudiante.
     * - Evaluada a través de la policy StudentPolicy::viewKardex().
     *
     * Datos compilados:
     * - Calificaciones actuales de Grupos y Exámenes (vía GetStudentKardexAction).
     * - Calificaciones históricas (OG) con su nivel resuelto.
     * - Catálogo de niveles para operaciones administrativas.
     * - Contexto del usuario para ruteo anidado en el frontend.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Actions\Students\GetStudentKardexAction  $getKardexAction
     * @return \Inertia\Response
     */
    public function kardex(User $user, GetStudentKardexAction $getKardexAction): Response
    {
        abort_if(!$user->student, 404, 'El usuario no tiene un perfil de estudiante asociado.');

        Gate::authorize('viewKardex', $user->student);

        $user->loadMissing([
            'student.degree',
        ]);

        $data = $getKardexAction->execute($user->student);

        // Calificaciones históricas (OG) con su nivel resuelto
        $data['legacyQualifications'] = $user->student
            ->legacyQualifications()
            ->with('level')
            ->orderBy('level_id')
            ->orderBy('period')
            ->get()
            ->map(fn($lq) => [
                'id'          => $lq->id,
                'level_id'    => $lq->level_id,
                'level_name'  => $lq->level?->level_tecnm ?? 'N/A',
                'period'      => $lq->period,
                'final_grade' => (int) $lq->final_grade,
            ]);

        // Catálogo de niveles para el select del modal:
        // Solo niveles del programa Regular (excluye Programa de egresados),
        // ordenados por id para respetar la secuencia Básico 1 → Intermedio 5.
        $data['levels'] = Level::where('program_type', 'Regular')
            ->orderBy('id')
            ->get(['id', 'level_tecnm']);

        // ID del usuario (necesario en el frontend para construir las rutas anidadas)
        $data['userId'] = $user->id;

        return Inertia::render('Academic/Kardex', $data);
    }
}
