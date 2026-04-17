<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest para actualizar el número de unidades evaluables de un grupo.
 *
 * Extrae la validación inline que existía en GroupController::updateUnits().
 */
class UpdateUnitsGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasAnyRole(['admin', 'teacher']);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'evaluable_units' => 'required|integer|min:1|max:8',
        ];
    }
}
