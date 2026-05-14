<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\AttemptEnum;
use App\Enums\AcademicStatus;

/**
 * FormRequest especializado para la actualización masiva de calificaciones de grupos.
 * 
 * Se separa del contrato individual para permitir validaciones específicas de lote
 * y asegurar la integridad de cada registro del grupo.
 */
class BulkUpdateGroupQualificationsRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) return false;

        if ($user->hasAnyRole(['admin', 'coordinator'])) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            $group = $this->route('group');
            return $group && $group->teacher_id === $user->teacher?->id
                && $group->status === AcademicStatus::GRADING;
        }

        return false;
    }

    /**
     * Obtiene las reglas de validación aplicables a la solicitud.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'qualifications' => 'required|array|min:1',
            'qualifications.*.qualification_id' => 'required|exists:qualifications,id',
            'qualifications.*.units_breakdown' => 'nullable|array',
            'qualifications.*.units_breakdown.*' => 'nullable',
            'qualifications.*.final_average' => 'required', // Se permite mixed (string/numeric) para 'NA', 'NP', etc.
            'qualifications.*.is_left' => 'nullable|boolean',
            'qualifications.*.attempt' => ['required', Rule::enum(AttemptEnum::class)],
        ];
    }

    /**
     * Mensajes de error personalizados para el lote de calificaciones.
     */
    public function messages(): array
    {
        return [
            'qualifications.required' => 'No se recibieron datos de calificaciones.',
            'qualifications.array'    => 'El formato de las calificaciones no es válido.',
            'qualifications.*.qualification_id.exists' => 'Uno de los registros de calificación no existe.',
            'qualifications.*.units_breakdown.required' => 'El desglose de unidades es obligatorio para todos los registros.',
        ];
    }
}
