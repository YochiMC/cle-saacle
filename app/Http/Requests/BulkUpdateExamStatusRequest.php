<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest para actualización masiva del estado de exámenes.
 *
 * Resuelve la deuda técnica del comentario explícito en ExamController::bulkStatus():
 * "the frontend sends new_status. I'll support both to not break."
 * Se unifica bajo `new_status` con `sometimes` para compatibilidad.
 */
class BulkUpdateExamStatusRequest extends FormRequest
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
            'ids'        => 'required|array',
            'ids.*'      => 'exists:exams,id',
            'new_status' => 'required|string',
        ];
    }

    /**
     * Normaliza el campo de entrada: el frontend puede enviar `new_status` o `status`.
     * Este método garantiza que siempre esté disponible como `new_status`.
     */
    protected function prepareForValidation(): void
    {
        if (!$this->has('new_status') && $this->has('status')) {
            $this->merge(['new_status' => $this->input('status')]);
        }
    }
}
