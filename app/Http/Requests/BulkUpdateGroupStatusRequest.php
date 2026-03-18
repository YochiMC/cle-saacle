<?php

namespace App\Http\Requests;

use App\Enums\GroupStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Clase de validación para la actualización masiva de estados de grupos.
 */
class BulkUpdateGroupStatusRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para esta solicitud.
     */
    public function authorize(): bool
    {
        return true; 
    }

    /**
     * Reglas de validación integrando el Enum nativo.
     */
    public function rules(): array
    {
        return [
            'ids'        => 'required|array|min:1',
            'ids.*'      => 'required|exists:groups,id',
            'new_status' => ['required', Rule::enum(GroupStatus::class)]
        ];
    }

    /**
     * Mensajes personalizados en español.
     */
    public function messages(): array
    {
        return [
            'ids.required'        => 'Debe seleccionar grupos para actualizar.',
            'new_status.required' => 'El nuevo estado es obligatorio.',
            'new_status.Illuminate\Validation\Rules\Enum' => 'El estado seleccionado no es válido dentro del catálogo del sistema.',
        ];
    }
}
