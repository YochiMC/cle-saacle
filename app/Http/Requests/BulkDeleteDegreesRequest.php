<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeleteDegreesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids'   => 'required|array|min:1',
            'ids.*' => 'required|exists:degrees,id'
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'Debe seleccionar al menos una carrera para eliminar.',
            'ids.array'    => 'Formato de selección inválido.',
            'ids.*.exists' => 'Una de las carreras seleccionadas ya no existe en el sistema.',
        ];
    }
}
