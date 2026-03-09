<?php

namespace App\Http\Controllers;

use App\Models\Qualification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class QualificationController extends Controller
{
    /**
     * Obtener calificaciones de un estudiante.
     */
    public function getQualifications($studentId): void
    {
        $qualifications = Qualification::where('student_id', $studentId)->get();
    }

    /**
     * Crear una nueva calificación con validación.
     */
    public function createQualification(Request $request): void
    {
        // 1. Validar los datos de entrada
        $validated = $request->validate([
            'unit1'        => 'required|numeric|min:0|max:10',
            'unit2'        => 'required|numeric|min:0|max:10',
            'finalAverage' => 'required|numeric|min:0|max:10',
            'is_approved'  => 'required|boolean',
            'is_left'      => 'required|boolean',
            'student_id'   => 'required|exists:students,id',
            'group_id'     => 'required|exists:groups,id',
        ]);

        // 2. Crear el registro
        $qualification = Qualification::create($validated);

    }

    /**
     * Actualizar usando Route Model Binding.
     */
    public function updateQualification(Request $request, Qualification $qualification): void
    {
        $validated = $request->validate([
            'unit1'        => 'sometimes|numeric|min:0|max:10',
            'unit2'        => 'sometimes|numeric|min:0|max:10',
            'finalAverage' => 'sometimes|numeric|min:0|max:10',
            'is_approved'  => 'sometimes|boolean',
            'is_left'      => 'sometimes|boolean',
        ]);

        $qualification->update($validated);

    }

    /**
     * Eliminar una calificación.
     */
    public function deleteQualification(Qualification $qualification): void
    {
        $qualification->delete();
    }
}