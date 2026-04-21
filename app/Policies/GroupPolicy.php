<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class GroupPolicy
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
        return $user->hasAnyRole(['coordinator', 'teacher', 'student']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Group $group): bool
    {
        return $user->hasRole('coordinator') 
        || $user->hasRole('teacher') && $group->teacher_id === $user->teacher?->id;
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
    public function update(User $user, Group $group): bool
    {
        return $user->hasRole('coordinator');
    }

    public function updateAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Group $group): bool
    {
        return $user->hasRole('coordinator');
    }

    public function deleteAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }
    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Group $group): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Group $group): bool
    {
        return false;
    }

    public function enroll(User $user, Group $group): bool
    {
        return $user->hasAnyRole(['coordinator', 'student']);
    }

    public function unenroll(User $user, Group $group): bool
    {
        return $user->hasAnyRole(['coordinator', 'student']);
    }

    public function bulkUnenroll(User $user, Group $group): bool
    {
        return $user->hasRole('coordinator');
    }

    public function updateUnits(User $user, Group $group): bool
    {
        return $user->hasAnyRole(['coordinator', 'teacher']);
    }

    public function complete(User $user, Group $group): bool
    {
        return $user->hasRole('coordinator');
    }


}
