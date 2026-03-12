<?php

namespace App\Actions;

use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreateStudentWithUser
{
    /**
     * Crea un User y un Student en una sola transacción.
     * Los datos de entrada vienen en snake_case.
     */
    public function execute(array $data): Student
    {
        return DB::transaction(function () use ($data) {

            // 1. Crear el usuario vinculado
            $user = User::create([
                'name'           => $data['first_name'] . ' ' . $data['last_name'],
                'email'    => $data['email'] ?? $data['num_control'] . '@leon.tecnm.mx',
                'password' => Hash::make($data['password'] ?? $data['num_control']), // Contraseña por defecto
                'phone'          => $data['phone'] ?? null,
                'email_recovery' => $data['email_recovery'] ?? null,
            ]);

            $user->assignRole('student'); // Asignar el rol de estudiante

            // 2. Crear el estudiante vinculado al usuario
            $student = Student::create([
                'user_id'         => $user->id,
                'first_name'      => $data['first_name'],
                'last_name'       => $data['last_name'],
                'num_control'     => $data['num_control'],
                'gender'          => $data['gender'],
                'birthdate'       => $data['birthdate'],
                'semester'        => $data['semester'] ?? null,
                'degree_id'       => $data['degree_id'],
                'type_student_id' => $data['type_student_id'],
                'level_id'        => $data['level_id'],
                'status'          => 'active',
            ]);

            return $student;
        });
    }
}
