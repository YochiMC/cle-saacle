<?php

namespace App\Http\Controllers;

use App\Models\Degree;
use App\Models\Student;
use App\Models\Teacher;
use App\Http\Requests\StoreDegreeRequest;
use App\Http\Requests\UpdateDegreeRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

/**
 * Controlador para la Gestión del Catálogo de Carreras / Programas Académicos.
 */
class DegreeController extends Controller
{
    /**
     * Muestra la vista de catálogo o sandbox con datos base.
     */
    public function index()
    {
        return Inertia::render('RecursosYochi/Test', [
            'degrees'  => Degree::all(),
            'students' => Student::all(),
            'teachers' => Teacher::all(),
        ]);
    }

    /**
     * Almacena una nueva carrera.
     */
    public function store(StoreDegreeRequest $request): RedirectResponse
    {
        Degree::create($request->validated());

        return redirect()->back()->with('success', 'Carrera creada correctamente.');
    }

    /**
     * Actualiza una carrera existente.
     */
    public function update(UpdateDegreeRequest $request, Degree $degree): RedirectResponse
    {
        $degree->update($request->validated());

        return redirect()->back()->with('success', 'Carrera actualizada correctamente.');
    }

    /**
     * Elimina una carrera.
     */
    public function destroy(Degree $degree): RedirectResponse
    {
        $degree->delete();

        return redirect()->back()->with('success', 'Carrera eliminada correctamente.');
    }
}
