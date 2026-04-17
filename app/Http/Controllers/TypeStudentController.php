<?php

namespace App\Http\Controllers;

use App\Models\TypeStudent;
use App\Http\Requests\StoreTypeStudentRequest;
use App\Http\Requests\UpdateTypeStudentRequest;
use Illuminate\Http\RedirectResponse;

/**
 * Controlador para la Gestión del Catálogo de Tipos de Alumnos.
 */
class TypeStudentController extends Controller
{
    /**
     * Lista todos los tipos de alumnos registrados.
     */
    public function index()
    {
        return TypeStudent::all();
    }

    /**
     * Almacena un nuevo tipo de alumno.
     */
    public function store(StoreTypeStudentRequest $request): RedirectResponse
    {
        TypeStudent::create($request->validated());

        return redirect()->back()->with('success', 'Tipo de alumno creado correctamente.');
    }

    /**
     * Actualiza un tipo de alumno existente.
     */
    public function update(UpdateTypeStudentRequest $request, TypeStudent $typeStudent): RedirectResponse
    {
        $typeStudent->update($request->validated());

        return redirect()->back()->with('success', 'Tipo de alumno actualizado correctamente.');
    }

    /**
     * Elimina un tipo de alumno.
     */
    public function destroy(TypeStudent $typeStudent): RedirectResponse
    {
        $typeStudent->delete();

        return redirect()->back()->with('success', 'Tipo de alumno eliminado correctamente.');
    }
}
