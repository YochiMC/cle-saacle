<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeleteTypeStudentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids'   => 'required|array|min:1',
            'ids.*' => 'required|exists:type_students,id'
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'Debe seleccionar al menos un tipo de estudiante para eliminar.',
            'ids.array'    => 'Formato de selección inválido.',
            'ids.*.exists' => 'Uno de los tipos de estudiante seleccionados ya no existe en el sistema.',
        ];
    }
}
