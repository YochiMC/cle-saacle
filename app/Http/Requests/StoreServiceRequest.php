<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Valida la creación de un nuevo registro de servicio o pago de alumno.
 */
class StoreServiceRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Obtiene las reglas de validación aplicables a la solicitud.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file'             => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'type'             => ['required', 'string', \Illuminate\Validation\Rule::in(array_column(\App\Enums\ServiceType::cases(), 'value'))],
            'amount'           => ['required', 'numeric', 'min:0'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
        ];
    }

    /**
     * Mensajes de error personalizados para la validación.
     */
    public function messages(): array
    {
        return [
            'file.required'       => 'El comprobante de pago es obligatorio.',
            'file.mimes'          => 'El comprobante debe ser un archivo PDF, JPG, JPEG o PNG.',
            'file.max'            => 'El comprobante no debe superar los 5MB.',
            'type.required'       => 'El tipo de pago es obligatorio.',
            'amount.required'     => 'El monto es obligatorio.',
            'amount.numeric'      => 'El monto debe ser numérico.',
        ];
    }
}
