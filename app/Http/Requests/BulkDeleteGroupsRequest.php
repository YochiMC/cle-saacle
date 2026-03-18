<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Clase de validación para la eliminación masiva de grupos.
 */
class BulkDeleteGroupsRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para esta solicitud.
     */
    public function authorize(): bool
    {
        return true; // Controlado por Middleware de roles
    }

    /**
     * Reglas de validación.
     */
    public function rules(): array
    {
        return [
            'ids'   => 'required|array|min:1',
            'ids.*' => 'required|exists:groups,id'
        ];
    }

    /**
     * Mensajes personalizados.
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'Debe seleccionar al menos un grupo para eliminar.',
            'ids.array'    => 'Formato de selección inválido.',
            'ids.*.exists' => 'Uno de los grupos seleccionados ya no existe en el sistema.',
        ];
    }
}
