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
use App\Http\Resources\ExamResource;
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
    public function dashboardView(Request $request)
    {
        $data = [
            'students' => [],
            'teachers' => [],
            'degrees' => [],
            'levels' => [],
            'groups' => [],
            'typeStudents' => [],
            'exams' => [],
        ];

        if ($request->user()->hasRole(['admin', 'coordinator'])) {
            $data['students'] = StudentResource::collection(Student::with(['degree', 'level'])->get())->resolve();
            $data['teachers'] = TeacherResource::collection(Teacher::all())->resolve();
            $data['degrees'] = Degree::all();
            $data['levels'] = Level::all();
            $data['groups'] = Group::with('students')->get();
            $data['typeStudents'] = TypeStudent::getOptions();
            $data['exams'] = Exam::with('students')->get();
        }

        return Inertia::render('Dashboard', $data);
    }

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
            'studentStatuses' => array_map(fn($status) => ['value' => $status->value, 'label' => $status->label()], StudentStatus::cases()),
        ]);
    }

    /**
     * Renderiza el catálogo de grupos filtrado según el rol del usuario.
     * Implementa la regla de negocio de ocultar el nombre del docente según la fecha configurada.
     *
     * @return \Inertia\Response
     */
    public function groupsView(Request $request, \App\Services\TeacherVisibilityService $visibilityService)
    {
        $user = $request->user();
        $ocultarDocentes = $visibilityService->isBeforeRevealDate($user);

        $grupos = Group::with(['teacher', 'level', 'period', 'qualifications.student'])
            ->withCount('qualifications')
            ->visibleToUser($user)
            ->get();

        return Inertia::render('Groups/Index', [
            'grupos' => GroupResource::collection($grupos)->resolve(),
            'levels' => LevelResource::collection(Level::all()->sortBy('level_tecnm')->values())->resolve(),
            'teachers' => $ocultarDocentes ? [] : TeacherResource::collection(Teacher::all())->resolve(),
            'periods' => Period::all(),
            'statuses' => array_map(fn($status) => ['value' => $status->value, 'label' => $status->label()], \App\Enums\AcademicStatus::cases()),
            'modes' => \App\Enums\GroupMode::getOptions(),
            'types' => \App\Enums\GroupType::getOptions(),
        ]);
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
        // Eager load relations needed for period calculation
        $studentsRaw = Student::with(['degree', 'level', 'qualifications.group', 'exams'])->get();
        
        $students = $studentsRaw->map(function ($student) {
            $periodIds = collect();
            
            // Extract periods from qualifications (groups)
            foreach ($student->qualifications as $q) {
                if ($q->group && $q->group->period_id) {
                    $periodIds->push($q->group->period_id);
                }
            }
            
            // Extract periods from exams
            foreach ($student->exams as $exam) {
                if ($exam->period_id) {
                    $periodIds->push($exam->period_id);
                }
            }
            
            // Use StudentResource for base data and append period_ids
            $resource = \App\Http\Resources\StudentResource::make($student)->resolve();
            $resource['period_ids'] = $periodIds->unique()->values()->all();
            
            return $resource;
        })->all();

        $teachers = TeacherResource::collection(Teacher::all())->resolve();
        $degrees = Degree::all();
        $levels = Level::all();
        $type_students = TypeStudent::getOptions();
        $groups = Group::all();
        $periods = Period::orderBy('id', 'desc')->get();

        return Inertia::render('Academic/Reports', [
            'students' => $students,
            'teachers' => $teachers,
            'degrees' => $degrees,
            'levels' => $levels,
            'groups' => $groups,
            'typeStudents' => $type_students,
            'periods' => $periods,
        ]);
    }

    public function examsView(Request $request, \App\Services\TeacherVisibilityService $visibilityService)
    {
        $user = $request->user();
        $ocultarDocentes = $visibilityService->isBeforeRevealDate($user);

        $exams = Exam::with(['students', 'teacher', 'period'])
            ->withCount('students')
            ->visibleToUser($user)
            ->get();

        $teachers = $ocultarDocentes ? [] : Teacher::all();
        $periods = Period::all();

        return Inertia::render('Exams/Index', [
            'examenes' => ExamResource::collection($exams)->resolve(),
            'teachers' => $teachers,
            'periods' => $periods,
            'statuses' => array_map(fn($s) => ['value' => $s->value, 'label' => $s->label()], \App\Enums\AcademicStatus::cases()),
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
                ->map(fn($groups) => [
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
        // ID del estudiante (necesario para generar la constancia)
        $data['studentId'] = $user->student->id;
        // Estado del estudiante (útil para mostrar acciones condicionadas en la UI)
        $data['studentStatus'] = $user->student->status?->value ?? null;

        return Inertia::render('Academic/Kardex', $data);
    }

    /**
     * Genera y descarga el Kardex completo del alumno en formato PDF.
     *
     * Incluye:
     * - Calificaciones actuales de Grupos y Exámenes (via GetStudentKardexAction).
     * - Calificaciones históricas (OG).
     * - Promedio calculado sobre todas las calificaciones numéricas >= 70.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Actions\Students\GetStudentKardexAction  $getKardexAction
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadKardexPdf(User $user, GetStudentKardexAction $getKardexAction)
    {
        abort_if(!$user->student, 404, 'El usuario no tiene un perfil de estudiante asociado.');

        Gate::authorize('viewKardex', $user->student);

        $user->loadMissing(['student.degree']);

        $data = $getKardexAction->execute($user->student);

        // Calificaciones históricas (OG)
        $legacyQualifications = $user->student
            ->legacyQualifications()
            ->with('level')
            ->orderBy('level_id')
            ->orderBy('period')
            ->get()
            ->map(fn($lq) => [
                'id'          => $lq->id,
                'level_name'  => $lq->level?->level_tecnm ?? 'N/A',
                'period'      => $lq->period,
                'final_grade' => (int) $lq->final_grade,
            ])->all();

        // Calcular promedio global (calificaciones numéricas >= 70 de ambas secciones)
        $todasLasCalificaciones = collect($data['kardexData'])
            ->map(fn($r) => $r['calificacion'] ?? $r['grade'] ?? null)
            ->merge(collect($legacyQualifications)->map(fn($lq) => $lq['final_grade']))
            ->filter(fn($c) => is_numeric($c))
            ->values();

        $promedio = $todasLasCalificaciones->isNotEmpty()
            ? round($todasLasCalificaciones->avg(), 2)
            : null;

        $pdfData = [
            'studentInfo'          => $data['studentInfo'],
            'kardexData'           => $data['kardexData'],
            'legacyQualifications' => $legacyQualifications,
            'promedio'             => $promedio,
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('kardex.pdf', $pdfData)
            ->setPaper('letter', 'portrait');

        $fileName = 'Kardex_' . $user->student->num_control . '.pdf';

        return $pdf->download($fileName);
    }
}
