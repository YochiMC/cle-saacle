<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Valida la creación de un nuevo registro de servicio o pago de alumno.
 *
 * Segunda capa de seguridad: valida que el usuario autenticado sea estudiante
 * antes de que el controlador invoque la policy.
 */
class StoreServiceRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     *
     * Solo estudiantes pueden crear servicios (subir comprobantes de pago).
     */
    public function authorize(): bool
    {
        return $this->user()?->hasRole('student') ?? false;
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
            'type'             => ['required', 'string', \Illuminate\Validation\Rule::in(\App\Enums\ServiceType::EXAMEN->value, \App\Enums\ServiceType::CURSO->value)],
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
            'type.required'       => 'Debes especificar si el pago es para Examen o Curso.',
            'type.in'             => 'El tipo debe ser Examen o Curso.',
            'amount.required'     => 'El monto es obligatorio.',
            'amount.numeric'      => 'El monto debe ser numérico.',
        ];
    }
}
