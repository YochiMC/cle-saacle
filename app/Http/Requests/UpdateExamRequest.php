<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest para actualización de Exámenes.
 *
 * Permite ediciones parciales usando `sometimes|required` para evitar
 * rechazos cuando el formulario envía solo campos modificados.
 */
class UpdateExamRequest extends FormRequest
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
            'exam_type'        => 'sometimes|required|string',
            'status'           => 'sometimes|required|string',
            'capacity'         => 'sometimes|required|integer|min:1',
            'start_date'       => 'sometimes|required|date',
            'end_date'         => 'sometimes|required|date|after_or_equal:start_date',
            'mode'             => 'sometimes|required|string',
            'application_time' => 'nullable|string',
            'classroom'        => 'nullable|string|max:255',
            'period_id'        => 'sometimes|required|exists:periods,id',
            'teacher_id'       => 'nullable|integer|exists:teachers,id',
        ];
    }
}
