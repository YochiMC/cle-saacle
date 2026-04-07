<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Document;
use App\Enums\DocumentStatus;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

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
        $userId = auth()->id();

        // Generar nombre único para el archivo
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();

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
    public function destroy(string $id)
    {
        //
    }
}
