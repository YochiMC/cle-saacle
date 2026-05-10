<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\AttemptEnum;

/**
 * FormRequest para actualizar la calificación individual de un alumno en un examen.
 *
 * Extrae la validación inline que existía en ExamController::updatePivot().
 */
class UpdateExamPivotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasAnyRole(['admin', 'teacher', 'coordinator']);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'units_breakdown' => 'required|array',
            'final_average'   => 'nullable|numeric',
            'is_left'         => 'required|boolean',
            'attempt'         => ['required', Rule::enum(AttemptEnum::class)],
        ];
    }
}
