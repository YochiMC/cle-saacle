<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeacherRequest extends FormRequest
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
                'required',
                'email',
                'string',
                'lowercase',
                'max:255',
                Rule::unique('users', 'email')->whereNull('deleted_at'),
            ],
            'password'       => 'string|min:8|confirmed',
            'phone'          => 'nullable|string|max:20',
            'email_recovery' => 'nullable|email|max:255',

            // ── Campos del Docente ──────────────────────────────────────────
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'category'   => 'required|string|in:A,B,C',
            'level'      => 'required|string|max:50',
            'rfc' => [
                'required',
                'string',
                'max:13',
                Rule::unique('teachers', 'rfc')->whereNull('deleted_at'),
            ],
            'curp' => [
                'required',
                'string',
                'max:18',
                Rule::unique('teachers', 'curp')->whereNull('deleted_at'),
            ],
            'clabe' => [
                'required',
                'string',
                'max:18',
                Rule::unique('teachers', 'clabe')->whereNull('deleted_at'),
            ],
            'ttc_hours' => 'required|integer|min:0',
            'bank_name' => 'required|string|max:255',
            'grade'     => 'required|string|max:100',
            'is_native' => 'required|boolean',
        ];
    }
}
