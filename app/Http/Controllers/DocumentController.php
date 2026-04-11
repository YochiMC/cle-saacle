<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;

/**
 * Controlador de Documentos de Usuario.
 *
 * @todo PENDIENTE DE INTEGRACIÓN — Este controlador no tiene rutas activas en web.php.
 *       Antes de conectarlo, se deben realizar las siguientes mejoras:
 *
 *       1. Extraer validaciones inline (duplicadas entre create y update) a FormRequests:
 *          - createDocument()  → App\Http\Requests\StoreDocumentRequest
 *          - updateDocument()  → App\Http\Requests\UpdateDocumentRequest
 *
 *       2. Corregir los retornos: todos los métodos devuelven void.
 *          Deben retornar RedirectResponse o JsonResponse.
 *
 *       3. getDocuments() asigna $documents = Document::all() sin retornarla
 *          ni pasarla a ninguna vista — la variable queda en el limbo.
 */
class DocumentController extends Controller
{
    public function createDocument(Request $request): void
    {
        $validate = $request->validate([
            'user_id'   => 'required|integer|exists:users,id',
            'type'      => 'required|string|max:100',
            'file_path' => 'required|string|max:255',
            'status'    => 'required|string|max:100',
            'comments'  => 'nullable|string|max:255',
        ]);

        $document = Document::create($validate);
    }

    public function updateDocument(Document $document, Request $request): void
    {
        $validate = $request->validate([
            'user_id'   => 'required|integer|exists:users,id',
            'type'      => 'required|string|max:100',
            'file_path' => 'required|string|max:255',
            'status'    => 'required|string|max:100',
            'comments'  => 'nullable|string|max:255',
        ]);

        $document->update($validate);
    }

    public function getDocuments(): void
    {
        $documents = Document::all();
    }

    public function deleteDocument(Document $document): void
    {
        $document->delete();
    }
}
