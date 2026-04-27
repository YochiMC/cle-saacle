<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Valida la actualización de un registro de servicio existente.
 */
class UpdateServiceRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Obtiene las reglas de validación aplicables a la solicitud.
     */
    public function rules(): array
    {
        return [
            'status'   => ['required', 'string', \Illuminate\Validation\Rule::in(\App\Enums\ServiceStatus::reviewValues())],
            'comments' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Mensajes de error personalizados para la validación.
     */
    public function messages(): array
    {
        return [
            'status.required' => 'El estatus de revisión es obligatorio.',
            'status.in'       => 'El estatus de revisión no es válido.',
            'comments.max'    => 'Los comentarios no deben exceder los 1000 caracteres.',
        ];
    }
}
