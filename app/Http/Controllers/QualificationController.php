<?php

namespace App\Http\Controllers;

use App\Models\Qualification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\UpdateQualificationsRequest;
use App\Http\Requests\UpdateQualificationRequest;

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
            'unit_1'        => 'required|numeric|min:0|max:100',
            'unit_2'        => 'required|numeric|min:0|max:100',
            'final_avarage' => 'required|numeric|min:0|max:100',
            'is_approved'  => 'required|boolean',
            'is_left'      => 'required|boolean',
            'student_id'   => 'required|exists:students,id',
            'group_id'     => 'required|exists:groups,id',
        ]);

        // 2. Crear el registro
        $qualification = Qualification::create($validated);
    }

    /**
     * Actualiza una sola calificación.
     */
    public function update(UpdateQualificationRequest $request, Qualification $qualification)
    {
        $qualification->update($request->validated());
        return redirect()->back()->with('success', 'Calificación individual guardada exitosamente.');
    }

    /**
     * Eliminar una calificación.
     */
    public function deleteQualification(Qualification $qualification): void
    {
        $qualification->delete();
    }

    /**
     * Actualiza masivamente un array de calificaciones proveniente de la vista de hoja de cálculo.
     */
    public function bulkUpdate(UpdateQualificationsRequest $request)
    {
        DB::transaction(function () use ($request) {
            $qualifications = $request->validated('qualifications');
            
            foreach ($qualifications as $item) {
                Qualification::where('id', $item['qualification_id'])->update([
                    'unit_1' => $item['unit_1'] ?? null,
                    'unit_2' => $item['unit_2'] ?? null,
                    'is_approved' => $item['is_approved'] ?? false,
                    'is_left' => $item['is_left'] ?? false,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Calificaciones guardadas exitosamente.');
    }
}