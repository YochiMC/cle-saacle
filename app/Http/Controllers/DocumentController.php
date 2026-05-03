<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;
use App\Actions\DeleteStudentDocument;
use App\Actions\StoreStudentDocument;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Document;
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
     * Devuelve la ruta física del archivo y valida su existencia.
     */
    private function resolveDocumentAbsolutePath(Document $document): string
    {
        if (! Storage::disk($document->disk)->exists($document->file_path)) {
            abort(404, 'Archivo no encontrado.');
        }

        return Storage::disk($document->disk)->path($document->file_path);
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
            (int) Auth::id()
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
    public function download(Document $document): BinaryFileResponse
    {
        Gate::authorize('view', $document);    

        $absolutePath = $this->resolveDocumentAbsolutePath($document);

        return response()->download($absolutePath, $document->original_name);
    }
}
