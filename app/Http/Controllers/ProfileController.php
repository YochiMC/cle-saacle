<?php

namespace App\Http\Controllers;

use App\Actions\DeleteStudentWithUser;
use App\Actions\DeleteTeacherWithUser;
use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Http\Resources\DocumentResource;
use App\Http\Resources\UserResource;
use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Requests\DeleteProfileRequest;
use App\Models\Degree;
use App\Models\Level;
use App\Models\TypeStudent;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Resuelve los tipos de documento visibles según el rol principal del usuario.
     *
     * Regla:
     * - Teacher/Docente: usa los tipos requeridos para docente.
     * - Student/Alumno: usa los tipos requeridos para alumno.
     * - Otros roles: usa catálogo completo para evitar bloquear la UI.
     *
     * @param User $user
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
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $documentTypeOptions = $this->resolveDocumentTypeOptions($request->user());

        return Inertia::render('Profile/User/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'documents' => DocumentResource::collection($request->user()->documents()->latest()->get())->resolve(),
            'documentTypes' => $documentTypeOptions,
        ]);
    }

    /**
     * Display an admin profile view for a specific user.
     */
    public function show(User $user): Response
    {
        // Cargamos las relaciones para mapear correctamente teacher/student en UserResource.
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

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(DeleteProfileRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function delete(
        User $user,
        DeleteStudentWithUser $deleteStudentWithUser,
        DeleteTeacherWithUser $deleteTeacherWithUser
    ): RedirectResponse {
        // Regla de seguridad: evitar auto-eliminación desde el panel administrativo.
        if ($user->id === Auth::id()) {
            return Redirect::back()->with('error', 'No puedes eliminar tu propio usuario desde esta vista.');
        }

        // Usamos relaciones reales del modelo para decidir la estrategia de borrado.
        $user->loadMissing(['student', 'teacher']);

        if ($user->student) {
            $deleteStudentWithUser->execute($user->student);
        } elseif ($user->teacher) {
            $deleteTeacherWithUser->execute($user->teacher);
        } else {
            // Fallback para usuarios sin perfil vinculado.
            $user->delete();
        }

        return Redirect::route('users')->with('success', 'Usuario eliminado correctamente.');
    }

    /**
     * Muestra el Kardex de calificaciones (Grupos y Exámenes) de un usuario con rol Estudiante.
     */
    public function kardex(User $user): Response
    {
        abort_if(!$user->student, 404, 'El usuario no tiene un perfil de estudiante asociado.');

        $user->loadMissing([
            'student.degree',
        ]);

        $student = $user->student;

        $studentInfo = [
            'name' => $student->full_name,
            'controlNumber' => $student->num_control,
            'career' => $student->degree->name ?? 'N/A',
        ];

        // 1. Obtener Cursos del alumno
        $cursos = $student->qualifications()
            ->with(['group.level', 'group.period'])
            ->get()
            ->map(function ($qualification) use ($student) {
                $group = $qualification->group;
                $nivel = $group?->level?->level_tecnm ?? 'N/A';
                $modalidad = $group?->type?->value ?? 'Curso Normal';

                $row = [
                    'id' => $qualification->student_id,
                    'full_name' => $student->full_name,
                    'matricula' => $student->num_control,
                    'gender' => $student->gender,
                    'semester' => $student->semester,
                    'qualification_id' => $qualification->id,
                    'is_left' => (bool) ($qualification->is_left ?? false),
                ];

                foreach ($this->normalizeBreakdown($qualification->units_breakdown ?? []) as $key => $value) {
                    $row[$key] = $value;
                }

                $row['final_average'] = $qualification->final_average;
                $calificacion = $this->lastMeaningfulValue($row);

                $sortKey = $this->levelSortKey($nivel);

                return [
                    'sort_group' => $sortKey,
                    'sort_exam' => 0,
                    'nivel' => $nivel,
                    'grupo' => $group?->name ?? 'N/A',
                    'materia' => $nivel . ' - ' . $modalidad,
                    'calificacion' => $calificacion ?? 'NA',
                    'resultado' => is_numeric($calificacion) && $calificacion >= 70 ? 'Acreditado' : 'No Acreditado',
                    'periodo' => $group?->period?->name ?? 'N/A',
                    'modalidad' => 'Curso',
                ];
            });

        // 2. Obtener Exámenes
        $examenes = $student->exams()
            ->withPivot('calificacion', 'units_breakdown', 'final_average')
            ->with('period')
            ->get()
            ->map(function ($exam) use ($student) {
                $row = [
                    'id' => $exam->pivot->student_id ?? $exam->id,
                    'full_name' => $student->full_name,
                    'matricula' => $student->num_control,
                    'gender' => $student->gender,
                    'semester' => $student->semester,
                    'exam_student_id' => $exam->pivot->id ?? null,
                    'final_average' => $exam->pivot->final_average,
                ];

                foreach ($this->normalizeBreakdown($exam->pivot->units_breakdown ?? []) as $key => $value) {
                    $row[$key] = $value;
                }

                $calificacionFinal = $this->lastMeaningfulValue($row);
                $grade = $calificacionFinal;
                $gradeStr = strtolower(trim((string) $grade));
                $resultado = (is_numeric($grade) && $grade >= 70) || in_array($gradeStr, ['a', 'acreditado', 'aprobado'], true)
                    ? 'Acreditado'
                    : 'No Acreditado';

                return [
                    'sort_group' => 999,
                    'sort_exam' => 1,
                    'nivel' => 'N/A',
                    'grupo' => $exam->name ?? 'N/A',
                    'materia' => 'Examen de ' . $exam->exam_type->value,
                    'calificacion' => $calificacionFinal,
                    'resultado' => $resultado,
                    'periodo' => $exam->period?->name ?? 'N/A',
                    'modalidad' => 'Examen',
                ];
            });

        // 3. Unificar y numerar manteniendo el orden estricto (Cursos primero, Exámenes después)
        $kardexData = $cursos
            ->sortBy(function (array $item) {
                return sprintf(
                    '%03d|%s|%s',
                    $item['sort_group'],
                    mb_strtolower((string) $item['periodo']),
                    mb_strtolower((string) $item['grupo'])
                );
            })
            ->concat($examenes)
            ->values()
            ->map(function (array $item, int $index) {
                return [
                    'no' => $index + 1,
                    'nivel' => $item['nivel'],
                    'grupo' => $item['grupo'],
                    'materia' => $item['materia'],
                    'calificacion' => $item['calificacion'],
                    'periodo' => $item['periodo'],
                    'subject' => $item['materia'],
                    'grade' => $item['calificacion'],
                    'status' => $item['resultado'],
                    'period' => $item['periodo'],
                ];
            })
            ->all();

        return Inertia::render('Academic/Kardex', compact('studentInfo', 'kardexData'));
    }

    /**
     * Normaliza units_breakdown cuando llega como JSON crudo o arreglo.
     */
    private function normalizeBreakdown(mixed $breakdown): array
    {
        if (is_string($breakdown)) {
            $breakdown = json_decode($breakdown, true);
        }

        return is_array($breakdown) ? $breakdown : [];
    }

    /**
     * Obtiene el último valor útil de una fila, ignorando metadata y contenedores.
     */
    private function lastMeaningfulValue(array $row): mixed
    {
        $ignoredKeys = [
            'id',
            'full_name',
            'matricula',
            'gender',
            'semester',
            'qualification_id',
            'exam_student_id',
            'is_left',
        ];

        $visibleValues = [];

        foreach ($row as $key => $value) {
            if (in_array($key, $ignoredKeys, true) || $key === 'units_breakdown') {
                continue;
            }

            if (is_array($value) || is_object($value)) {
                continue;
            }

            $visibleValues[$key] = $value;
        }

        if ($visibleValues === []) {
            return null;
        }

        return end($visibleValues);
    }

    /**
     * Genera una clave de orden para el nivel visible del grupo.
     */
    private function levelSortKey(?string $levelName): int
    {
        $normalized = mb_strtolower(trim((string) $levelName));

        $base = match (true) {
            str_contains($normalized, 'básico') || str_contains($normalized, 'basico') => 100,
            str_contains($normalized, 'intermedio') => 200,
            str_contains($normalized, 'avanzado') => 300,
            default => 900,
        };

        preg_match('/(\d+)/', $normalized, $matches);
        $number = isset($matches[1]) ? (int) $matches[1] : 0;

        return $base + $number;
    }
}
