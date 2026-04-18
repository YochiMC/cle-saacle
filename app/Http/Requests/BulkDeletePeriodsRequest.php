<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeletePeriodsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids'   => 'required|array|min:1',
            'ids.*' => 'required|exists:periods,id'
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'Debe seleccionar al menos un periodo para eliminar.',
            'ids.array'    => 'Formato de selección inválido.',
            'ids.*.exists' => 'Uno de los periodos seleccionados ya no existe en el sistema.',
        ];
    }
}
