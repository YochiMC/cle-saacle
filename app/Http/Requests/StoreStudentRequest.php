<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // ── Campos del Usuario ──────────────────────────────────────────
            'email' => [
                'nullable',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->whereNull('deleted_at'),
            ],
            // ¡Cambio importante! Cambiamos 'required' por 'nullable'
            'password'       => 'nullable|string|min:8|confirmed',
            'phone'          => 'nullable|string|max:20',
            'email_recovery' => [
                'nullable',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email_recovery')->whereNull('deleted_at'),
            ],

            // ── Campos del Estudiante ───────────────────────────────────────
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'num_control' => [
                'required',
                'string',
                'max:20',
                Rule::unique('students', 'num_control')->whereNull('deleted_at'),
            ],
            'gender'          => 'required|string|in:M,F',
            'birthdate'       => 'required|date',
            'semester'        => 'nullable|integer|min:0|max:13',
            'degree_id'       => 'required|exists:degrees,id',
            'type_student_id' => 'required|exists:type_students,id',
            'level_id'        => 'required|exists:levels,id',
        ];
    }
}
