<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Group;

class GroupController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validamos los datos recibidos del formulario
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'mode' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'schedule' => 'required|string|max:255',
            'classroom' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|url|max:255',
            'status' => 'required|string|max:255',
            'period_id' => 'required|exists:periods,id',
            'teacher_id' => 'required|exists:teachers,id',
            'level_id' => 'required|exists:levels,id',
        ]);

        // 2. Creamos el registro en la base de datos
        Group::create($validated);

        // 3. Redirigimos de vuelta con un mensaje de éxito (Inertia lo maneja sin recargar)
        return redirect()->back()->with('success', 'Grupo creado exitosamente.');
    }
}
