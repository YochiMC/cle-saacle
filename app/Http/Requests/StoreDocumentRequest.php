<?php

namespace App\Http\Requests;

use App\Enums\DocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Solicitud para almacenar un nuevo documento de usuario.
 *
 * Centraliza la validacion del archivo y del tipo de documento para mantener
 * el controlador enfocado en la orquestacion del flujo de subida.
 */
class StoreDocumentRequest extends FormRequest
{
    private const ALLOWED_MIMES = 'pdf';
    private const MAX_FILE_SIZE_KB = 5120;

    /**
     * Determina si el usuario autenticado puede enviar esta solicitud.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Devuelve las reglas de validacion que aplican al almacenamiento.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:' . self::ALLOWED_MIMES,
                'max:' . self::MAX_FILE_SIZE_KB,
            ],
            'type' => [
                'required',
                Rule::in(DocumentType::values()),
            ],
            'custom_name' => [
                'nullable',
                'string',
                'max:100',
                'required_if:type,evidencia',
                'regex:/^[\\p{L}\\p{N}\\s\\-_]+$/u',
            ],
        ];
    }

    /**
     * Devuelve mensajes de validacion para mantener consistencia con el frontend.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Debes seleccionar un archivo para continuar.',
            'file.mimes' => 'El formato del archivo no es válido. Solo se permiten archivos PDF.',
            'file.max' => 'El archivo supera el tamaño permitido. El límite máximo es de 5 MB.',
            'type.required' => 'Debes seleccionar un tipo de documento.',
            'type.in' => 'El tipo de documento seleccionado no es válido.',
            'custom_name.regex' => 'El nombre personalizado contiene caracteres no permitidos.',
        ];
    }
}
