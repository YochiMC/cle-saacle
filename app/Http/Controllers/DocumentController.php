<?php

namespace App\Http\Controllers;

use App\Actions\DeleteStudentDocument;
use App\Actions\ServeStoredFile;
use App\Actions\StoreStudentDocument;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        Gate::authorize('create', Document::class);
        $action->execute(
            $request->file('file'),
            $request->validated('type'),
            (int) Auth::id(),
            $request->validated('custom_name')
        );

        return back()->with('success', 'Documento subido exitosamente.');
    }

    /**
     * Actualiza el estatus y comentarios de un documento (Revisión Administrativa).
     */
    public function update(UpdateDocumentRequest $request, Document $document): RedirectResponse
    {
        Gate::authorize('update', $document);
        $document->update($request->validated());

        return back()->with('success', 'Documento actualizado exitosamente.');
    }

    /**
     * Elimina un documento del sistema (Físico y Lógico).
     */
    public function destroy(Document $document, DeleteStudentDocument $action): RedirectResponse
    {
        Gate::authorize('delete', $document);
        $action->execute($document);

        return back()->with('success', 'Documento eliminado exitosamente.');
    }

    /**
     * Descarga un documento autorizado conservando su nombre original.
     */
    public function download(Document $document, ServeStoredFile $action): StreamedResponse
    {
        Gate::authorize('view', $document);

        return $action->execute($document->disk, $document->file_path, $document->original_name);
    }

    /**
     * Muestra el documento en modo inline para formatos compatibles.
     */
    public function preview(Document $document, ServeStoredFile $action): StreamedResponse
    {
        Gate::authorize('view', $document);

        return $action->execute($document->disk, $document->file_path, $document->original_name, 'inline');
    }
}
