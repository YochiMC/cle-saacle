<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;


class UpdateRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
            'name' => ['required', 'string', 'max:255', 'unique:roles,name', Rule::unique('roles', 'name')->whereNull('deleted_at'),],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del rol es obligatorio.',
            'name.unique' => 'Ya existe un rol con ese nombre.',
            'permissions.array' => 'El formato de permisos no es válido.',
            'permissions.*.exists' => 'Uno o más permisos seleccionados no existen.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nombre del rol',
            'permissions' => 'permisos',
        ];
    }
}
