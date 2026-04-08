<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
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
    public function store(Request $request)
    {
        // Validar entrada del usuario sin espacios en los mimes
        $validated = $request->validate([
            'file' => 'required|mimes:pdf,doc,docx,jpg,png|max:10240',
            'type' => 'required|string|max:100',
        ]);

        $file = $request->file('file');
        $userId = Auth::id();

        // Generar nombre único para el archivo
        $fileName = Str::uuid().'.'.$file->getClientOriginalExtension();

        // Almacenar archivo en la carpeta del usuario
        $path = $file->storeAs("documentos/user_{$userId}", $fileName, 'local');

        // Crear registro del documento en la base de datos
        Document::create([
            'user_id' => $userId,
            'type' => $validated['type'],
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'disk' => 'local',
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
    public function update(Request $request, string $id)
    {
        //
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

    public function download(Document $document)
    {
        // Verificar que el documento pertenece al usuario autenticado
        if ($document->user_id !== Auth::id()) {
            abort(403, 'No autorizado para descargar este documento.');
        }

        // Verificar que el archivo existe en el almacenamiento
        if (! Storage::disk($document->disk)->exists($document->file_path)) {
            abort(404, 'Archivo no encontrado.');
        }

        // Descargar el archivo con su nombre original desde la ruta física del disco local
        return response()->download(
            Storage::disk($document->disk)->path($document->file_path),
            $document->original_name
        );
    }
}
