<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeleteExamsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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
