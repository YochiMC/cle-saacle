<?php

namespace App\Http\Requests;

use App\Enums\AcademicStatus;
use App\Enums\GroupMode;
use App\Enums\GroupType;
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
            'mode'         => ['sometimes', 'required', Rule::enum(GroupMode::class)],
            'type'         => ['sometimes', 'required', Rule::enum(GroupType::class)],
            'capacity'     => 'sometimes|required|integer|min:1',
            'schedule'     => [
                'sometimes',
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    $value = trim((string) $value);

                    if (! preg_match('/\b(\d{2}):([0-5]\d)\b/u', $value, $matches)) {
                        $fail('El horario debe incluir una hora en formato HH:MM entre 08:00 y 20:59.');

                        return;
                    }

                    $hour = (int) $matches[1];

                    if ($hour < 8 || $hour > 20) {
                        $fail('El horario debe usar una hora entre 08:00 y 20:59.');
                    }
                },
            ],
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
            'mode.enum'         => 'La modalidad seleccionada no es válida.',
            'type.enum'         => 'El tipo de grupo no es válido.',
            'capacity.integer'   => 'La capacidad debe ser un número entero.',
            'period_id.exists'   => 'El periodo seleccionado no existe.',
            'status.enum'       => 'El estado seleccionado no es válido.',
        ];
    }
}
