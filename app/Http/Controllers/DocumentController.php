<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{   

    public function store(Request $request){

        $request->validate([
            'file' => 'required|mimes:pdf,doc,docx, jpg, png|max:10240',
            'type' => 'required|string|max:100',
        ]);

        $file = $request->file('file');

        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("documentos/user_" . auth()->id(), $fileName, 'local');

        Document::create([
            'user_id' => auth()->id(),
            'type' => $request->input('type'),
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'disk' => 'local',
            'status' => 'pending',
        ]);

        return back()->with('success', 'Documento subido exitosamente.');
    }
    public function createDocument(Request $request): void
    {
        $validate = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'type' => 'required|string|max:100',
            'file_path' => 'required|string|max:255',
            'status' => 'required|string|max:100',
            'comments' => 'nullable|string|max:255',

        ]);

        $document = Document::create($validate);
    }

    public function updateDocument(Document $document, Request $request): void
    {
        $validate = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'type' => 'required|string|max:100',
            'file_path' => 'required|string|max:255',
            'status' => 'required|string|max:100',
            'comments' => 'nullable|string|max:255',
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
