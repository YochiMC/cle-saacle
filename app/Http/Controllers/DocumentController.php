<?php

namespace App\Http\Controllers;

use App\Models\Document;

use Illuminate\Http\Request;

class DocumentController extends Controller
{
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
