<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
        return $this->user() && $this->user()->hasAnyRole(['admin', 'teacher', 'coordinator']);
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
        return [
            'qualifications' => 'required|array',
            'qualifications.*.student_id' => 'required|exists:students,id',
            'qualifications.*.units_breakdown' => 'required|array',
            'qualifications.*.final_average' => 'nullable|numeric',
        ];
    }
}
