<?php

namespace App\Http\Requests;

use App\Enums\StudentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rule;

/**
 * Valida la actualización individual del estatus de acreditación de un alumno.
 */
class UpdateAccreditationStatusRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     */
    public function authorize(): bool
    {
        return true; // La autorización se maneja generalmente vía Middleware/Policies
    }

    /**
     * Obtiene las reglas de validación aplicables a la solicitud.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $allowedStatuses = [
            StudentStatus::IN_REVIEW->value,
            StudentStatus::ACCREDITED->value,
            StudentStatus::RELEASED->value,
            StudentStatus::SUSPENDED->value,
        ];

        return [
            'status' => [
                'required',
                'string',
                new Enum(StudentStatus::class),
                Rule::in($allowedStatuses),
            ],
        ];
    }

    /**
     * Mensajes de error personalizados para la validación.
     */
    public function messages(): array
    {
        return [
            'status.required' => 'El campo estatus es obligatorio.',
            'status.string'   => 'El formato del estatus no es válido.',
            'status.in'       => 'El estatus seleccionado no es válido para este módulo.',
        ];
    }
}
