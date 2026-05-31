<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

/**
 * Policy de autorización para documentos.
 *
 * - `create` solo para `teacher` y `student`.
 * - `admin` conserva acceso total en el resto de acciones.
 * - `coordinator` revisa y consulta documentos.
 */
class DocumentPolicy
{
    /**
     * Conserva acceso total para admin, excepto al crear documentos.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($ability === 'create') {
            return null;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        return null;
    }

    /** Permite listar documentos para revisión. */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite consultar un documento propio o por coordinación. */
    public function view(User $user, Document $document): bool
    {
        return $user->id === $document->user_id || $user->hasRole('coordinator');
    }

    /** Permite subir documentos al usuario autenticado. */
    public function create(User $user): bool
    {
        return $user->hasAnyRole('teacher', 'student');
    }

    /** Permite revisar/actualizar estatus de documentos. */
    public function update(User $user, Document $document): bool
    {
        return $user->hasRole('coordinator');
    }

    /** Permite eliminar únicamente documentos propios. */
    public function delete(User $user, Document $document): bool
    {
        return $user->id === $document->user_id;
    }

    /** Reserva restauración para administrador (vía before). */
    public function restore(User $user, Document $document): bool
    {
        return false;
    }

    /** Reserva eliminación forzada para administrador (vía before). */
    public function forceDelete(User $user, Document $document): bool
    {
        return false;
    }
}
