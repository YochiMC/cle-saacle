<?php

namespace App\Actions;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreateTeacherWithUser
{
    /**
     * Crea un User y un Teacher en una sola transacción.
     * Los datos de entrada vienen en snake_case.
     */
    public function execute(array $data): Teacher
    {
        return DB::transaction(function () use ($data) {

            // 1. Crear el usuario vinculado
            $user = User::create([
                'name'           => $data['first_name'] . ' ' . $data['last_name'],
                'email'          => $data['email'],
                'password'       => Hash::make($data['curp']),
                'phone'          => $data['phone'] ?? null,
                'email_recovery' => $data['email_recovery'] ?? null,
            ]);

            $user->assignRole('teacher'); // Asignar el rol de docente

            // 2. Crear el docente vinculado al usuario
            $teacher = Teacher::create([
                'user_id'    => $user->id,
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

            return $teacher;
        });
    }
}
