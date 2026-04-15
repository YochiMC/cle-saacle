<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Actions\UploadFile;
use App\Models\Document;
use App\Http\Requests\StoreDocumentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Controlador de Documentos de Usuario.
 *
 * Estado actual:
 * - El módulo ya está integrado con rutas activas para crear, descargar,
 *   actualizar estatus y eliminar documentos.
 * - La actualización de documentos está restringida a roles de revisión
 *   (admin/coordinator).
 * - La descarga permite al propietario del documento o revisores autorizados.
 */
class DocumentController extends Controller
{
    /**
     * Determina si el usuario autenticado puede revisar documentos de terceros.
     */
    private function canReviewDocuments(): bool
    {
        return Auth::user()?->hasRole('admin') || Auth::user()?->hasRole('coordinator');
    }

    /**
     * Verifica si el usuario puede descargar el documento solicitado.
     */
    private function canDownloadDocument(Document $document): bool
    {
        return $document->user_id === Auth::id() || $this->canReviewDocuments();
    }

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
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * Valida y almacena un nuevo documento para el usuario autenticado.
     * El archivo se guarda en storage local con un nombre único y se crea
     * un registro en la base de datos con estado pendiente de revisión.
     */
    public function store(StoreDocumentRequest $request, UploadFile $uploadFile): RedirectResponse
    {
        $validated = $request->validated();
        $file = $request->file('file');
        $userId = Auth::id();

        $fileInfo = $uploadFile->execute($file, "documentos/user_{$userId}");

        // Crear registro del documento en la base de datos
        Document::create([
            'user_id' => $userId,
            'type' => $validated['type'],
            'original_name' => $fileInfo['original_name'],
            'file_path' => $fileInfo['path'],
            'disk' => $fileInfo['disk'],
            'status' => DocumentStatus::PENDING,
        ]);

        return back()->with('success', 'Documento subido exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Document $document): RedirectResponse
    {
        if (! $this->canReviewDocuments()) {
            abort(403, 'No autorizado para actualizar este documento.');
        }

        $validated = $request->validate([
            'comments' => 'nullable|string|max:255',
            'status' => ['required', Rule::in(DocumentStatus::reviewValues())],
        ]);

        $document->update([
            'status' => $validated['status'],
            'comments' => $validated['comments'] ?? null,
        ]);

        return back()->with('success', 'Documento actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Document $document): RedirectResponse
    {
        // Verificar que el documento pertenece al usuario autenticado.
        if ($document->user_id !== Auth::id()) {
            abort(403, 'No autorizado para eliminar este documento.');
        }

        // Eliminar archivo físico antes de remover el registro en base de datos.
        if (Storage::disk($document->disk)->exists($document->file_path)) {
            Storage::disk($document->disk)->delete($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Documento eliminado exitosamente.');
    }

    /**
     * Descarga un documento autorizado conservando su nombre original.
     */
    public function download(Document $document): BinaryFileResponse
    {
        if (! $this->canDownloadDocument($document)) {
            abort(403, 'No autorizado para descargar este documento.');
        }

        $absolutePath = $this->resolveDocumentAbsolutePath($document);

        // Descargar el archivo con su nombre original desde la ruta física del disco local
        return response()->download($absolutePath, $document->original_name);
    }
}
