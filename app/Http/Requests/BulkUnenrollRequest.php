<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest reutilizable para dar de baja masiva de alumnos.
 *
 * Consolida la validación inline idéntica que existía en:
 * - GroupController::bulkUnenroll()
 * - ExamController::bulkUnenroll()
 *
 * Ambos métodos reciben el mismo contrato: un array de IDs de alumnos existentes.
 */
class BulkUnenrollRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasAnyRole(['admin', 'coordinator']);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ids'   => 'required|array',
            'ids.*' => 'exists:students,id',
        ];
    }
}
