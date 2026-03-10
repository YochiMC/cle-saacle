<?php

namespace App\Actions;

use App\Models\Teacher;
use Illuminate\Support\Facades\DB;

class UpdateTeacherWithUser
{
    /**
     * Actualiza el User y el Teacher en una sola transacción.
     * Los datos de entrada vienen en snake_case.
     */
    public function execute(Teacher $teacher, array $data): Teacher
    {
        return DB::transaction(function () use ($teacher, $data) {

            // 1. Actualizar los datos del usuario asociado
            $teacher->user->update([
                'name'           => $data['first_name'] . ' ' . $data['last_name'],
                'email'          => $data['email'],
                'phone'          => $data['phone'] ?? null,
                'email_recovery' => $data['email_recovery'] ?? null,
            ]);

            // 2. Actualizar los datos del docente
            $teacher->update([
                'first_name' => $data['first_name'],
                'last_name'  => $data['last_name'],
                'category'   => $data['category'],
                'level'      => $data['level'],
                'rfc'        => $data['rfc'],
                'curp'       => $data['curp'],
                'clabe'      => $data['clabe'],
                'ttc_hours'  => $data['ttc_hours'],
                'bank_name'  => $data['bank_name'],
                'grade'      => $data['grade'],
                'is_native'  => $data['is_native'],
            ]);

            return $teacher->fresh();
        });
    }
}
