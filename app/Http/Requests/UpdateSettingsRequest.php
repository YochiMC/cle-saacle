<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Enrollment - Sin reglas cronológicas
            'courses_enrollment_start' => 'nullable|date|max:255',
            'courses_enrollment_end' => 'nullable|date|max:255',
            'exams_enrollment_start' => 'nullable|date|max:255',
            'exams_enrollment_end' => 'nullable|date|max:255',
            'pe_enrollment_start' => 'nullable|date|max:255',
            'pe_enrollment_end' => 'nullable|date|max:255',

            // Cursos - Clases y Evaluaciones (Reglas Cronológicas)
            'courses_active_start' => 'nullable|date|max:255',
            'courses_active_end' => 'nullable|date|max:255|after_or_equal:courses_active_start',
            'courses_evaluation_start' => 'nullable|date|max:255|after_or_equal:courses_active_start',
            'courses_evaluation_end' => 'nullable|date|max:255|after_or_equal:courses_evaluation_start',

            // Exámenes - Evaluaciones (Reglas Cronológicas)
            'exams_evaluation_start' => 'nullable|date|max:255',
            'exams_evaluation_end' => 'nullable|date|max:255|after_or_equal:exams_evaluation_start',

            // PE - Clases y Evaluaciones (Reglas Cronológicas)
            'pe_active_start' => 'nullable|date|max:255',
            'pe_active_end' => 'nullable|date|max:255|after_or_equal:pe_active_start',
            'pe_evaluation_start' => 'nullable|date|max:255|after_or_equal:pe_active_start',
            'pe_evaluation_end' => 'nullable|date|max:255|after_or_equal:pe_evaluation_start',

            // Configuración Visual
            'teacher_reveal_date' => 'nullable|date|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'courses_active_end.after_or_equal' => 'La fecha de fin de clases debe ser igual o posterior a la fecha de inicio (Cursos Regulares).',
            'courses_evaluation_start.after_or_equal' => 'La fecha de inicio de evaluación debe ser igual o posterior al INICIO de clases (Cursos Regulares).',
            'courses_evaluation_end.after_or_equal' => 'La fecha de fin de evaluación debe ser igual o posterior al inicio de evaluación (Cursos Regulares).',
            
            'exams_evaluation_end.after_or_equal' => 'La fecha de fin de evaluación debe ser igual o posterior al inicio de evaluación (Exámenes).',
            
            'pe_active_end.after_or_equal' => 'La fecha de fin de clases debe ser igual o posterior a la fecha de inicio (Programa Egresados).',
            'pe_evaluation_start.after_or_equal' => 'La fecha de inicio de evaluación debe ser igual o posterior al INICIO de clases (Programa Egresados).',
            'pe_evaluation_end.after_or_equal' => 'La fecha de fin de evaluación debe ser igual o posterior al inicio de evaluación (Programa Egresados).',
        ];
    }
}
