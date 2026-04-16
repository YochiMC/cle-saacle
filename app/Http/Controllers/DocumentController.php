<?php

namespace App\Http\Controllers;

use App\Actions\DeleteStudentDocument;
use App\Actions\StoreStudentDocument;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Controlador de Documentos de Usuario.
 *
 * Este controlador actúa como un orquestador ligero (Thin Controller),
 * delegando la validación a FormRequests y el manejo físico/lógico de archivos a Actions.
 */
class DocumentController extends Controller
{
    /**
     * Almacena un nuevo documento para el usuario autenticado.
     */
    public function store(StoreDocumentRequest $request, StoreStudentDocument $action): RedirectResponse
    {
        $userId = Auth::id();
        if ($userId === null) {
            abort(403, 'Usuario no autenticado.');
        }

        $action->execute(
            $request->file('file'),
            $request->validated('type'),
            (int) $userId
        );

        return back()->with('success', 'Documento subido exitosamente.');
    }

    /**
     * Actualiza el estatus y comentarios de un documento (Revisión Administrativa).
     */
    public function update(UpdateDocumentRequest $request, Document $document): RedirectResponse
    {
        $document->update($request->validated());

        return back()->with('success', 'Documento actualizado exitosamente.');
    }

    /**
     * Elimina un documento del sistema (Físico y Lógico).
     */
    public function destroy(Document $document, DeleteStudentDocument $action): RedirectResponse
    {
        // Regla de seguridad: Solo el propietario puede eliminar su documento
        if ($document->user_id !== Auth::id()) {
            abort(403, 'No autorizado para eliminar este documento.');
        }

        $action->execute($document);

        return back()->with('success', 'Documento eliminado exitosamente.');
    }

    /**
     * Descarga el documento solicitado de forma segura.
     */
    public function download(Document $document): BinaryFileResponse
    {
        $user = Auth::user();

        // Regla de seguridad: Propietario o Revisores autorizados
        $canDownload =
            $document->user_id === Auth::id()
            || ($user instanceof User && $user->hasAnyRole(['admin', 'coordinator']));

        if (!$canDownload) {
            abort(403, 'No autorizado para descargar este documento.');
        }

        // Verificar existencia en el disco privado
        if (!Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'Archivo físico no encontrado en el servidor.');
        }

        // Servir descarga desde el disco local restringido
        $absolutePath = storage_path('app/' . ltrim($document->file_path, '/'));

        return response()->download($absolutePath, $document->original_name);
    }
}
