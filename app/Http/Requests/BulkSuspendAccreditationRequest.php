<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Valida la lista de IDs de alumnos para suspensión masiva.
 */
class BulkSuspendAccreditationRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:students,id'],
        ];
    }

    /**
     * Mensajes de error personalizados para la validación.
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'Debes seleccionar al menos un alumno.',
            'ids.array'    => 'La selección debe ser un conjunto de datos.',
            'ids.min'      => 'Debes seleccionar al menos un alumno para suspender.',
            'ids.*.exists' => 'Uno de los alumnos seleccionados no existe en el sistema.',
        ];
    }
}
