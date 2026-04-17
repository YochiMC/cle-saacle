<?php

namespace App\Http\Requests;

use App\Enums\DocumentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/**
 * Solicitud para actualizar la revisión administrativa de un documento.
 */
class UpdateDocumentRequest extends FormRequest
{
    private const MAX_COMMENTS_LENGTH = 255;

    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     */
    public function authorize(): bool
    {
        return Auth::user()?->hasAnyRole(['admin', 'coordinator']) ?? false;
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
                'max:' . self::MAX_COMMENTS_LENGTH,
                'required_if:status,' . DocumentStatus::REJECTED->value,
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
            'comments.required_if' => 'Debes agregar un comentario cuando rechazas el documento.',
            'comments.max'    => 'El comentario no debe exceder los 255 caracteres.',
        ];
    }
}
