<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Valida la creación de una nueva carrera o programa académico.
 */
class StoreDegreeRequest extends FormRequest
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
            'name'       => ['required', 'string', 'max:100', 'unique:degrees,name'],
            'curriculum' => ['required', 'string', 'max:30'],
        ];
    }

    /**
     * Mensajes de error personalizados para la validación.
     */
    public function messages(): array
    {
        return [
            'name.required'       => 'El nombre de la carrera es obligatorio.',
            'name.unique'         => 'Esta carrera ya se encuentra registrada.',
            'curriculum.required' => 'La clave del plan de estudios (curriculum) es obligatoria.',
        ];
    }
}
