<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest para la eliminación de la cuenta del usuario autenticado.
 *
 * Extrae la validación inline que existía en ProfileController::destroy().
 * La regla current_password verifica que la contraseña proporcionada
 * coincide con la del usuario autenticado en sesión.
 */
class DeleteProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'password' => ['required', 'current_password'],
        ];
    }
}
