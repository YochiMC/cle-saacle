<?php

namespace App\Http\Requests;

use App\Enums\GroupStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkUpdateExamsStatusRequest extends FormRequest
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
            'new_status' => ['required', Rule::enum(GroupStatus::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'Debe seleccionar examenes para actualizar.',
            'ids.array' => 'Formato de seleccion invalido.',
            'ids.*.exists' => 'Uno de los examenes seleccionados ya no existe en el sistema.',
            'new_status.required' => 'El nuevo estado es obligatorio.',
        ];
    }
}
