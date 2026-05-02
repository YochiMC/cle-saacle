<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest para eliminación masiva de exámenes.
 *
 * Refuerza defensa en profundidad:
 * - middleware y policy filtran por rol;
 * - authorize evita uso accidental del request fuera de su flujo seguro.
 */
class BulkDeleteExamsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasAnyRole(['admin', 'coordinator']);
    }

    public function rules(): array
    {
        return [
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|exists:exams,id',
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'Debe seleccionar al menos un examen para eliminar.',
            'ids.array' => 'Formato de seleccion invalido.',
            'ids.*.exists' => 'Uno de los examenes seleccionados ya no existe en el sistema.',
        ];
    }
}
