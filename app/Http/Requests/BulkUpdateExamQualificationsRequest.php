<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\AttemptEnum;
use App\Enums\AcademicStatus;

/**
 * FormRequest para la actualización masiva de calificaciones de Exámenes.
 *
 * Análogo a UpdateQualificationsRequest (Grupos), pero referencia
 * la tabla pivot exam_student en lugar de qualifications.
 */
class BulkUpdateExamQualificationsRequest extends FormRequest
{
    /**
     * Determinamos si el usuario está autorizado a hacer esta petición.
     */
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
     * Reglas de validación del contrato de calificaciones de examen.
     *
     * Contrato esperado desde el frontend (ExamView):
     * cada item trae el ID del registro pivot + units_breakdown + promedio calculado.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $exam = $this->route('exam') ?? \App\Models\Exam::find($this->input('exam_id'));
        $isConvalidacion = $exam && ($exam->exam_type === \App\Enums\ExamType::CONVALIDACION || $exam->exam_type?->value === \App\Enums\ExamType::CONVALIDACION->value);

        return [
            'qualifications'                             => 'required|array',
            'qualifications.*.student_id'                => 'required|exists:students,id',
            'qualifications.*.units_breakdown'           => 'required|array',
            'qualifications.*.units_breakdown.*'         => 'sometimes|nullable',
            'qualifications.*.units_breakdown.listening' => 'sometimes|nullable|integer|min:0|max:100',
            'qualifications.*.units_breakdown.reading'   => 'sometimes|nullable|integer|min:0|max:100',
            'qualifications.*.units_breakdown.writing'   => 'sometimes|nullable|integer|min:0|max:100',
            'qualifications.*.units_breakdown.speaking'  => $isConvalidacion
                ? 'sometimes|nullable|string|in:-,A1,A2,B1,B2,C1,C2'
                : 'sometimes|nullable|integer|min:0|max:100',
            'qualifications.*.final_average'             => 'nullable|numeric',
            'qualifications.*.is_left'                   => 'required|boolean',
            'qualifications.*.attempt'                   => ['required', Rule::enum(AttemptEnum::class)],
        ];
    }
}
