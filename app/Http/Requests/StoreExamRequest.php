<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest para creación y actualización de Exámenes.
 *
 * Consolida la validación duplicada que existía inline en
 * ExamController::store() y ExamController::update() (reglas idénticas).
 * Si en el futuro store/update divergen, se puede crear UpdateExamRequest
 * extendiendo esta clase.
 */
class StoreExamRequest extends FormRequest
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
            'exam_type'        => 'required|string',
            'status'           => 'required|string',
            'capacity'         => 'required|integer|min:1',
            'start_date'       => 'required|date',
            'end_date'         => 'required|date|after_or_equal:start_date',
            'mode'             => 'required|string',
            'application_time' => 'nullable|string',
            'classroom'        => 'nullable|string|max:255',
            'period_id'        => 'required|exists:periods,id',
            'teacher_id'       => 'nullable|integer|exists:teachers,id',
        ];
    }
}
