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
            'type'             => ['required', 'string', 'max:255'],
            'amount'           => ['required', 'numeric', 'min:0'],
            'status'           => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'file_path'        => ['nullable', 'string', 'max:255'],
            'student_id'       => ['required', 'exists:students,id'],
        ];
    }

    /**
     * Mensajes de error personalizados para la validación.
     */
    public function messages(): array
    {
        return [
            'type.required'       => 'El tipo de servicio es obligatorio.',
            'amount.required'     => 'El monto es obligatorio.',
            'amount.numeric'      => 'El monto debe ser un valor numérico.',
            'status.required'      => 'El estado del servicio es obligatorio.',
            'student_id.required' => 'El alumno asociado es obligatorio.',
            'student_id.exists'   => 'El alumno seleccionado no existe.',
        ];
    }
}
