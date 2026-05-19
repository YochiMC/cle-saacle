<?php

namespace App\Http\Requests;

use App\Enums\AcademicStatus;
use App\Enums\ExamType;
use App\Enums\GroupMode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'exam_type'        => ['sometimes', 'required', Rule::enum(ExamType::class)],
            'status'           => ['sometimes', 'required', Rule::enum(AcademicStatus::class)],
            'capacity'         => 'sometimes|required|integer|min:1',
            'start_date'       => 'sometimes|required|date',
            'end_date'         => 'sometimes|required|date|after_or_equal:start_date',
            'mode'             => ['sometimes', 'required', Rule::enum(GroupMode::class)],
            'application_time' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    $value = trim((string) $value);

                    if ($value === '') {
                        return;
                    }

                    if (! preg_match('/^(?:0[8-9]|1[0-9]|20):[0-5]\d$/', $value)) {
                        $fail('La hora de aplicación debe usar el formato HH:MM entre 08:00 y 20:59.');
                    }
                },
            ],
            'site'             => 'nullable|string|max:255',
            'period_id'        => 'sometimes|required|exists:periods,id',
            'teacher_id'       => 'nullable|integer|exists:teachers,id',
        ];
    }
}
