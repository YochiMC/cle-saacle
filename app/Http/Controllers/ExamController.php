<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|integer|exists:students,id',
            'nombre_examen' => 'required|string|max:255',
            'calificacion' => 'required|numeric|min:0|max:100',
            'fecha_aplicacion' => 'required|date',
        ]);

        Exam::create($validated);

        return redirect()->back()->with('success', 'Examen agregado correctamente.');
    }
}
