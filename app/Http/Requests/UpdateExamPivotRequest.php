<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\AttemptEnum;
use App\Enums\AcademicStatus;

/**
 * FormRequest para actualizar la calificación individual de un alumno en un examen.
 *
 * Extrae la validación inline que existía en ExamController::updatePivot().
 */
class UpdateExamPivotRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) return false;

        if ($user->hasAnyRole(['admin', 'coordinator'])) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            $exam = $this->route('exam');
            return $exam && $exam->teacher?->id === $user->teacher?->id
                && $exam->status === AcademicStatus::GRADING;
        }

        return false;
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
