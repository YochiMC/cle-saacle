<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Acción de borrado masivo de usuarios con perfil académico asociado.
 *
 * Orquesta la eliminación por tipo de perfil (Student o Teacher),
 * reutilizando las acciones especializadas existentes y garantizando
 * consistencia mediante una única transacción.
 */
class BulkDeleteUser
{
    public function __construct(
        private readonly DeleteStudentWithUser $deleteStudentWithUser,
        private readonly DeleteTeacherWithUser $deleteTeacherWithUser,
    ) {}

    /**
     * Ejecuta la eliminación masiva de usuarios.
     *
     * @param array<int, User> $users Colección de usuarios con relación student/teacher cargada.
     */
    public function execute(array $users): void
    {
        DB::transaction(function () use ($users) {
            foreach ($users as $user) {
                if ($user->student) {
                    $this->deleteStudentWithUser->execute($user->student);
                } elseif ($user->teacher) {
                    $this->deleteTeacherWithUser->execute($user->teacher);
                }
            }
        });
    }
}
