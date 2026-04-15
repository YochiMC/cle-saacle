<?php

namespace App\Http\Requests;

use App\Enums\DocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida la carga inicial de un documento por parte del alumno.
 */
class StoreDocumentRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     */
    public function authorize(): bool
    {
        return true; // La autorización se maneja generalmente vía middleware/auth
    }

    /**
     * Obtiene las reglas de validación aplicables a la solicitud.
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,jpg,png',
                'max:10240', // 10MB
            ],
            'type' => [
                'required',
                Rule::in(DocumentType::values()),
            ],
        ];
    }

    /**
     * Mensajes de error personalizados para la validación.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'El archivo es obligatorio.',
            'file.mimes'    => 'El formato del archivo debe ser: pdf, doc, docx, jpg o png.',
            'file.max'      => 'El archivo no debe pesar más de 10MB.',
            'type.required' => 'El tipo de documento es obligatorio.',
            'type.in'       => 'El tipo de documento seleccionado no es válido.',
        ];
    }
}
