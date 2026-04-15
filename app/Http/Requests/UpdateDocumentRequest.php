<?php

namespace App\Http\Requests;

use App\Enums\DocumentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/**
 * Valida la revisión administrativa de un documento.
 */
class UpdateDocumentRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     */
    public function authorize(): bool
    {
        // Solo administradores y coordinadores pueden revisar documentos
        return Auth::user()->hasAnyRole(['admin', 'coordinator']);
    }

    /**
     * Obtiene las reglas de validación aplicables a la solicitud.
     */
    public function rules(): array
    {
        return [
            'status' => [
                'required',
                Rule::in(DocumentStatus::reviewValues()),
            ],
            'comments' => [
                'nullable',
                'string',
                'max:255',
            ],
        ];
    }

    /**
     * Mensajes de error personalizados para la validación.
     */
    public function messages(): array
    {
        return [
            'status.required' => 'El estatus de revisión es obligatorio.',
            'status.in'       => 'El estatus seleccionado no es válido para una revisión.',
            'comments.max'    => 'El comentario no debe exceder los 255 caracteres.',
        ];
    }
}
