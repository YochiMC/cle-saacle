<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TypeStudent;

/**
 * Controlador de Tipos de Alumno (Regular, Egresado, Trabajador, etc.).
 *
 * @todo PENDIENTE DE INTEGRACIÓN — Este controlador no tiene rutas activas en web.php.
 *       Antes de conectarlo, se deben realizar las siguientes mejoras:
 *
 *       1. Extraer validaciones inline a FormRequests:
 *          - createTypeStudent()  → App\Http\Requests\StoreTypeStudentRequest
 *          - updateTypeStudent()  → App\Http\Requests\UpdateTypeStudentRequest
 *
 *       2. Corregir los retornos: todos los métodos devuelven void.
 *          Deben retornar RedirectResponse o JsonResponse.
 *
 *       3. getTypeStudent() no retorna ni pasa los datos a ninguna vista.
 */
class TypeStudentController extends Controller
{
    public function createTypeStudent(Request $request): void
    {
        $validate = $request->validate([
            'name' => 'required|string|max:20'
        ]);
        $typeStudent = TypeStudent::create($validate);
    }

    public function getTypeStudent(): void
    {
        $typeStudent = TypeStudent::all();
    }

    public function updateTypeStudent(Request $request, TypeStudent $typeStudent): void
    {
        $validate = $request->validate([
            'name' => 'required|string|max:20'
        ]);
        $typeStudent->update($validate);
    }

    public function deleteTypeStudent(TypeStudent $typeStudent): void
    {
        $typeStudent->delete();
    }
}
