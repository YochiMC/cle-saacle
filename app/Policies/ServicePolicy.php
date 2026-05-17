<?php

namespace App\Policies;

use App\Models\Service;
use App\Models\User;

/**
 * Policy para autorización del módulo de pagos/servicios de estudiantes.
 *
 * Reglas generales:
 * - Administrador: acceso total mediante `before`.
 * - Coordinador: gestión completa de revisión y autorización de servicios.
 * - Estudiante: acceso a consulta y gestión de servicios propios.
 *
 * Nota de diseño:
 * - Esta policy define autorización por habilidad y propiedad del recurso.
 * - La visibilidad de servicios por rol se delega al scope visibleToUser del modelo.
 */
class ServicePolicy
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

    /**
     * Permite listar servicios.
     *
     * Matriz:
     * - coordinator: acceso a todos.
     * - student: acceso a los suyos.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['coordinator', 'student']);
    }

    /**
     * Permite consultar un servicio específico.
     *
     * Matriz:
     * - coordinator: cualquier servicio.
     * - student: solo propios.
     */
    public function view(User $user, Service $service): bool
    {
        return $user->hasRole('coordinator') || ($user->hasRole('student') && $service->student_id === $user->student?->id);
    }

    /**
     * Permite crear un nuevo servicio.
     *
     * Matriz:
     * - student: puede crear.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('student');
    }

    /**
     * Permite actualizar estado y comentarios de un servicio (revisión administrativa).
     *
     * Matriz:
     * - coordinator: puede revisar cualquier servicio.
     */
    public function update(User $user, Service $service): bool
    {
        return $user->hasRole('coordinator');
    }

    /**
     * Permite eliminar un servicio.
     *
     * Matriz:
     * - student: solo propios.
     */
    public function delete(User $user, Service $service): bool
    {
        // Students may delete their own services only if they are still pending or were rejected.
        $allowedStatuses = ['pending', 'rejected'];
        return $user->hasRole('student')
            && $service->student_id === $user->student?->id
            && in_array($service->status, $allowedStatuses, true);
    }

    /**
     * Restauración no permitida.
     */
    public function restore(User $user, Service $service): bool
    {
        return false;
    }

    /**
     * Eliminación forzada no permitida.
     */
    public function forceDelete(User $user, Service $service): bool
    {
        return false;
    }

    /**
     * Permite descargar un comprobante de pago.
     *
     * Matriz:
     * - coordinator: descarga cualquiera.
     * - student: descarga solo propios.
     */
    public function download(User $user, Service $service): bool
    {
        return $user->hasRole('coordinator') || ($user->hasRole('student') && $service->student_id === $user->student?->id);
    }
}
