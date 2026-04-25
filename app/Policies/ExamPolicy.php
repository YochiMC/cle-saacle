<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

/**
 * Policy para autorización del módulo de exámenes académicos.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: gestión completa del recurso.
 * - Docente: acceso a exámenes asignados y acciones operativas específicas.
 * - Alumno: acceso de consulta e inscripción/baja sobre su propio flujo.
 */
class ExamPolicy
{
    /**
     * Otorga acceso total al administrador antes de evaluar habilidades específicas.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return null;
    }

    /** Permite listar exámenes. */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['coordinator', 'teacher', 'student']);
    }

    /**
     * Permite consultar un examen específico.
     *
     * Matriz:
     * - coordinator: cualquier examen.
     * - teacher: solo exámenes donde está asignado.
     * - student: solo exámenes donde está inscrito.
     */
    public function view(User $user, Exam $exam): bool
    {
        return $user->hasAnyRole(['coordinator'])
            || ($user->hasRole('teacher') && $exam->teacher?->id === $user->teacher?->id)
            || ($user->hasRole('student') && $exam->students()->where('student_id', $user->student?->id)->exists());
    }

    /** Permite crear exámenes. */
    public function create(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualizar un examen. */
    public function update(User $user, Exam $exam): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite actualización masiva de exámenes. */
    public function updateAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite eliminar un examen. */
    public function delete(User $user, Exam $exam): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite eliminación masiva de exámenes. */
    public function deleteAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Reserva restauración para administrador (vía before). */
    public function restore(User $user, Exam $exam): bool
    {
        return false;
    }

    /** Reserva eliminación forzada para administrador (vía before). */
    public function forceDelete(User $user, Exam $exam): bool
    {
        return false;
    }

    /** Permite inscribir alumnos al examen. */
    public function enroll(User $user, Exam $exam): bool
    {
        return $user->hasAnyRole(['coordinator', 'student']);
    }

    /** Permite dar de baja alumnos del examen. */
    public function unenroll(User $user, Exam $exam): bool
    {
        return $user->hasAnyRole(['coordinator', 'student']);
    }

    /** Permite dar de baja alumnos de forma masiva. */
    public function bulkUnenroll(User $user, Exam $exam): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite concluir un examen. */
    public function complete(User $user, Exam $exam): bool
    {
        return $user->hasRole('coordinator') || ($user->hasRole('teacher') && $exam->teacher?->id === $user->teacher?->id);
    }
}
