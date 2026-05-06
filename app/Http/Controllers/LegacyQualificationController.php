<?php

namespace App\Http\Controllers;

use App\Models\LegacyQualification;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class LegacyQualificationController extends Controller
{
    /**
     * Reglas de validación compartidas entre store y update.
     */
    private function rules(): array
    {
        return [
            'level_id'    => ['required', 'integer', 'exists:levels,id'],
            'period'      => ['required', 'string', 'max:50'],
            'final_grade' => ['required', 'integer', 'min:0', 'max:100'],
        ];
    }

    /**
     * Almacena una nueva calificación histórica para el estudiante.
     */
    public function store(Request $request, User $user): RedirectResponse
    {
        abort_if(! $user->student, 404, 'El usuario no tiene un perfil de estudiante asociado.');
        Gate::authorize('viewKardex', $user->student);

        $validated = $request->validate($this->rules());

        $user->student->legacyQualifications()->create($validated);

        return back()->with('success', 'Calificación histórica añadida correctamente.');
    }

    /**
     * Actualiza una calificación histórica existente.
     */
    public function update(Request $request, User $user, LegacyQualification $legacy): RedirectResponse
    {
        abort_if(! $user->student, 404, 'El usuario no tiene un perfil de estudiante asociado.');
        Gate::authorize('viewKardex', $user->student);

        // Protección extra: la calificación debe pertenecer al estudiante indicado en la URL.
        abort_if($legacy->student_id !== $user->student->id, 403);

        $validated = $request->validate($this->rules());

        $legacy->update($validated);

        return back()->with('success', 'Calificación histórica actualizada correctamente.');
    }

    /**
     * Elimina una calificación histórica.
     */
    public function destroy(User $user, LegacyQualification $legacy): RedirectResponse
    {
        abort_if(! $user->student, 404, 'El usuario no tiene un perfil de estudiante asociado.');
        Gate::authorize('viewKardex', $user->student);

        abort_if($legacy->student_id !== $user->student->id, 403);

        $legacy->delete();

        return back()->with('success', 'Calificación histórica eliminada correctamente.');
    }
}
