<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida la actualización de un nivel de idioma existente.
 */
class UpdateLevelRequest extends FormRequest
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
            'level_tecnm'  => [
                'required', 
                'string', 
                'max:20', 
                Rule::unique('levels', 'level_tecnm')->ignore($this->route('level'))
            ],
            'level_mcer'   => ['required', 'string', 'max:20'],
            'hours'        => ['required', 'integer', 'min:0'],
            'program_type' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * Mensajes de error personalizados para la validación.
     */
    public function messages(): array
    {
        return [
            'level_tecnm.required' => 'El nivel TecNM es obligatorio.',
            'level_tecnm.unique'   => 'Este nivel TecNM ya se encuentra registrado.',
            'level_mcer.required'  => 'El nivel MCER es obligatorio.',
            'hours.required'       => 'El número de horas es obligatorio.',
        ];
    }
}
