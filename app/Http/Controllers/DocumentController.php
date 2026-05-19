<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;
use App\Actions\DeleteStudentDocument;
use App\Actions\StoreStudentDocument;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
     * Devuelve el disco configurado para el documento y valida su existencia.
     */
    private function resolveDocumentDisk(Document $document): FilesystemAdapter
    {
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($document->disk);

        if (! $disk->exists($document->file_path)) {
            abort(404, 'Archivo no encontrado.');
        }

        return $disk;
    }

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
    public function download(Document $document): StreamedResponse
    {
        Gate::authorize('view', $document);

        $disk = $this->resolveDocumentDisk($document);

        return $disk->download($document->file_path, $document->original_name);
    }

    /**
     * Muestra el documento en modo inline para formatos compatibles.
     */
    public function preview(Document $document): StreamedResponse
    {
        Gate::authorize('view', $document);

        $disk = $this->resolveDocumentDisk($document);

        return $disk->response($document->file_path, $document->original_name);
    }
}
