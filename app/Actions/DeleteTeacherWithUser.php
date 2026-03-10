<?php

namespace App\Actions;

use App\Models\Teacher;
use Illuminate\Support\Facades\DB;

class DeleteTeacherWithUser
{
    /**
     * Realiza el soft-delete tanto del Teacher como del User asociado.
     *
     * NOTA: onDelete('cascade') de la migración NO dispara SoftDeletes,
     * por eso eliminamos manualmente ambos registros.
     */
    public function execute(Teacher $teacher): void
    {
        DB::transaction(function () use ($teacher) {

            // 1. Soft-delete del perfil del docente
            $teacher->delete();

            // 2. Soft-delete del usuario asociado
            $teacher->user->delete();
        });
    }
}
