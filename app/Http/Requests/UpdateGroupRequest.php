<?php

namespace App\Http\Requests;

use App\Enums\AcademicStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validaciones para la actualización de un grupo existente.
 */
class UpdateGroupRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasAnyRole(['admin', 'coordinator']);
    }

    /**
     * Reglas de validación que se aplican a la solicitud.
     */
    public function rules(): array
    {
        return [
            'mode'         => 'sometimes|required|string|max:255',
            'type'         => 'sometimes|required|string|max:255',
            'capacity'     => 'sometimes|required|integer|min:1',
            'schedule'     => 'sometimes|required|string|max:255',
            'classroom'    => ['nullable', 'string', 'max:255'],
            'meeting_link' => ['nullable', 'url', 'max:255'],
            'status'       => ['sometimes', 'required', 'string', Rule::enum(AcademicStatus::class)],
            'period_id'    => 'sometimes|required|exists:periods,id',
            'teacher_id'   => ['nullable', 'exists:teachers,id'],
            'level_id'     => 'sometimes|required|exists:levels,id',
            'evaluable_units' => 'nullable|integer|min:1',
        ];
    }

    /**
     * Mensajes de error personalizados (Español).
     */
    public function messages(): array
    {
        return [
            'capacity.integer'   => 'La capacidad debe ser un número entero.',
            'period_id.exists'   => 'El periodo seleccionado no existe.',
        ];
    }
}
