<?php

namespace App\Actions;

use App\Models\Student;
use App\Enums\StudentStatus;
use Illuminate\Support\Facades\DB;

class DeleteStudentWithUser
{
    /**
     * Marca el estudiante como inactivo y realiza el soft-delete
     * tanto del Student como del User asociado.
     *
     * NOTA: onDelete('cascade') de la migración NO dispara SoftDeletes,
     * por eso eliminamos manualmente ambos registros.
     */
    public function execute(Student $student): void
    {
        DB::transaction(function () use ($student) {

            // 1. Marcar el estudiante como inactivo antes de eliminarlo
            $student->status = StudentStatus::SUSPENDED;
            $student->save();

            // 2. Soft-delete del perfil del estudiante
            $student->delete();

            // 3. Soft-delete del usuario asociado
            $student->user->delete();
        });
    }
}
