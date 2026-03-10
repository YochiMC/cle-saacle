<?php

namespace App\Actions;

use App\Models\Student;
use Illuminate\Support\Facades\DB;

class UpdateStudentWithUser
{
    /**
     * Actualiza el User y el Student en una sola transacción.
     * Los datos de entrada vienen en snake_case.
     */
    public function execute(Student $student, array $data): Student
    {
        return DB::transaction(function () use ($student, $data) {

            // 1. Actualizar los datos del usuario asociado
            $student->user->update([
                'name'           => $data['first_name'] . ' ' . $data['last_name'],
                'email'          => $data['email'],
                'phone'          => $data['phone'] ?? null,
                'email_recovery' => $data['email_recovery'] ?? null,
            ]);

            // 2. Actualizar los datos del estudiante
            $student->update([
                'first_name'      => $data['first_name'],
                'last_name'       => $data['last_name'],
                'num_control'     => $data['num_control'],
                'gender'          => $data['gender'],
                'birthdate'       => $data['birthdate'],
                'semester'        => $data['semester'] ?? null,
                'degree_id'       => $data['degree_id'],
                'type_student_id' => $data['type_student_id'],
                'level_id'        => $data['level_id'],
            ]);

            return $student->fresh();
        });
    }
}
