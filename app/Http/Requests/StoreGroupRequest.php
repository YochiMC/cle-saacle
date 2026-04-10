<?php

namespace App\Http\Requests;

use App\Enums\AcademicStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validaciones para la creación de un nuevo grupo.
 */
class StoreGroupRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     */
    public function authorize(): bool
    {
        // El acceso se controla vía Middleware (auth:sanctum / spatie roles)
        return true;
    }

    /**
     * Reglas de validación que se aplican a la solicitud.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'mode'         => 'required|string|max:255',
            'type'         => 'required|string|max:255',
            'capacity'     => 'required|integer|min:1',
            'schedule'     => 'required|string|max:255',
            'classroom'    => ['nullable', 'string', 'max:255'],
            'meeting_link' => ['nullable', 'url', 'max:255'],
            'status'       => ['required', 'string', Rule::enum(AcademicStatus::class)],
            'period_id'    => 'required|exists:periods,id',
            'teacher_id'   => ['nullable', 'exists:teachers,id'],
            'level_id'     => 'required|exists:levels,id',
            'evaluable_units' => 'nullable|integer|min:1',
        ];
    }

    /**
     * Mensajes de error personalizados (Español).
     */
    public function messages(): array
    {
        return [
            'capacity.integer'   => 'La capacidad debe ser un número entero.',
            'meeting_link.url'   => 'El enlace de reunión debe ser una URL válida.',
            'period_id.exists'   => 'El periodo seleccionado no existe.',
            'teacher_id.exists'  => 'El docente seleccionado no existe.',
            'level_id.exists'    => 'El nivel seleccionado no existe.',
        ];
    }
}
