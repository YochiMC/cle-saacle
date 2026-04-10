<?php

namespace App\Http\Controllers;

use App\Models\Qualification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\UpdateQualificationsRequest;

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
        // Para altas nuevas exigimos todas las unidades presentes y válidas.
        $validated = $request->validate([
            'units_breakdown' => 'required|array',
            'units_breakdown.*' => 'nullable',
            'final_average' => 'required',
            'is_left' => 'required|boolean',
            'student_id' => 'required|exists:students,id',
            'group_id' => 'required|exists:groups,id',
        ]);

        $qualification = Qualification::create($validated);
    }

    /**
     * Actualiza una sola calificación.
     */
    public function update(Request $request, Qualification $qualification)
    {
        // En edición permitimos vacíos temporales por UX (inputs en blur),
        // pero conservamos validación numérica y rango cuando sí hay valor.
        $validated = $request->validate([
            'units_breakdown' => 'required|array',
            'units_breakdown.*' => 'nullable',
            'final_average' => 'required',
            'is_left' => 'required|boolean',
        ]);

        $qualification->update($validated);

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
            // Este contrato viene serializado desde GroupView (JSON de unidades por fila).
            $qualifications = $request->validated('qualifications');

            foreach ($qualifications as $item) {
                Qualification::where('id', $item['qualification_id'])->update([
                    'units_breakdown' => $item['units_breakdown'] ?? [],
                    'final_average' => $item['final_average'] ?? 0,
                    'is_left' => $item['is_left'] ?? false,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Calificaciones guardadas exitosamente.');
    }
}
