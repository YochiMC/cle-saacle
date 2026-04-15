<?php

namespace App\Http\Requests;

use App\Enums\DocumentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Solicitud para actualizar la revisión administrativa de un documento.
 *
 * Este request valida exclusivamente el flujo de revisión, permitiendo solo
 * estatus aprobados por el módulo y exigiendo comentarios cuando el
 * documento sea rechazado.
 */
class UpdateDocumentRequest extends FormRequest
{
    private const MAX_COMMENTS_LENGTH = 255;

    /**
     * Determina si el usuario autenticado puede enviar esta solicitud.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Devuelve las reglas de validación aplicables al flujo de revisión.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'comments' => [
                'nullable',
                'string',
                'max:' . self::MAX_COMMENTS_LENGTH,
                'required_if:status,' . DocumentStatus::REJECTED->value,
            ],
            'status' => ['required', Rule::in(DocumentStatus::reviewValues())],
        ];
    }

    /**
     * Mensajes de validación para mantener consistencia en la experiencia.
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Debes seleccionar un estatus de revisión.',
            'status.in' => 'El estatus seleccionado no es válido para este flujo.',
            'comments.required_if' => 'Debes agregar un comentario cuando rechazas el documento.',
            'comments.max' => 'El comentario no puede superar los 255 caracteres.',
        ];
    }
}
