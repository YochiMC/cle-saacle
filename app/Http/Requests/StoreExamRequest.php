<?php

namespace App\Http\Requests;

use App\Enums\AcademicStatus;
use App\Enums\ExamType;
use App\Enums\GroupMode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'exam_type'        => ['required', Rule::enum(ExamType::class)],
            'status'           => ['required', Rule::enum(AcademicStatus::class)],
            'capacity'         => 'required|integer|min:1',
            'start_date'       => 'required|date',
            'end_date'         => 'required|date|after_or_equal:start_date',
            'mode'             => ['required', Rule::enum(GroupMode::class)],
            'application_time' => [
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
            'period_id'        => 'required|exists:periods,id',
            'teacher_id'       => 'nullable|integer|exists:teachers,id',
        ];
    }
}
