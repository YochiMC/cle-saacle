<?php

namespace App\Http\Requests;

use App\Support\ValidationPatterns;
use App\Enums\TypeStudent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

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
            'phone'          => ['nullable', 'string', 'max:20', 'regex:' . ValidationPatterns::PHONE_NUMBER],
            'email_recovery' => [
                'nullable',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email_recovery')->whereNull('deleted_at'),
            ],

            // ── Campos del Estudiante ───────────────────────────────────────
            'first_name' => ['required', 'string', 'max:255', 'regex:' . ValidationPatterns::SPANISH_NAME],
            'last_name'  => ['required', 'string', 'max:255', 'regex:' . ValidationPatterns::SPANISH_NAME],
            'num_control' => [
                'required',
                'string',
                'max:20',
                Rule::unique('students', 'num_control')->whereNull('deleted_at'),
            ],
            'gender'       => 'required|string|in:M,F',
            'birthdate'    => 'required|date',
            'semester'     => 'nullable|integer|min:0|max:14',
            'degree_id'    => 'required|exists:degrees,id',
            'type_student' => ['required', new Enum(TypeStudent::class)],
            'level_id'     => 'required|exists:levels,id',
        ];
    }
}
