<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['teacher', 'coordinator']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Student $student): bool
    {
        return ($user->hasRole('student') && $student->user_id === $user->id)
            || $user->hasRole('coordinator');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Student $student): bool
    {
        return ($user->hasRole('student') && $student->user_id === $user->id)
            || $user->hasRole('coordinator');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Student $student): bool
    {
        return $user->hasRole('coordinator');
    }

    /**
     * Determina si el usuario puede eliminar alumnos de forma masiva.
     */
    public function bulkDelete(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    public function restore(User $user, Student $student): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Student $student): bool
    {
        return false;
    }

    public function viewKardex(User $user, Student $student): bool{
        return ($user->id === $student-> user_id && $user->hasRole('student'))
        || $user->hasRole('coordinator');
    }
}
