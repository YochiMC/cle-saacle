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
            'file' => 'required|mimes:pdf,doc,docx,jpg,png|max:100',
            'type' => ['required', Rule::in(DocumentType::values())],
        ];
    }
}
