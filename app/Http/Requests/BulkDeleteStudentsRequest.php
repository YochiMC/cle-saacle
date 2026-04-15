<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validación para eliminación masiva de alumnos.
 */
class BulkDeleteStudentsRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para esta solicitud.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas de validación.
     */
    public function rules(): array
    {
        return [
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|exists:students,id',
        ];
    }

    /**
     * Mensajes personalizados.
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'Debe seleccionar al menos un alumno para eliminar.',
            'ids.array' => 'Formato de selección inválido.',
            'ids.*.exists' => 'Uno de los alumnos seleccionados ya no existe en el sistema.',
        ];
    }
}
