<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Level;

/**
 * Controlador de Niveles de Idioma (MCER / TecNM).
 *
 * @todo PENDIENTE DE INTEGRACIÓN — Este controlador no tiene rutas activas en web.php.
 *       Antes de conectarlo, se deben realizar las siguientes mejoras:
 *
 *       1. Extraer validaciones inline a FormRequests:
 *          - createLevel()  → App\Http\Requests\StoreLevelRequest
 *          - updateLevel()  → App\Http\Requests\UpdateLevelRequest
 *
 *       2. Corregir los retornos: todos los métodos devuelven void, lo que
 *          imposibilita que Inertia/JSON consuma las respuestas. Deben retornar
 *          RedirectResponse o JsonResponse según corresponda.
 *
 *       3. Revisar la lógica unique en updateLevel — la regla
 *          'unique:levels,level_tecnm' fallará al editar el mismo registro
 *          sin la excepción del ID actual (unique:levels,level_tecnm,{id}).
 */
class LevelController extends Controller
{
    public function createLevel(Request $request): void
    {
        $validate = $request->validate([
            'level_tecnm' => 'required|string|max:20|unique:levels,level_tecnm',
            'level_mcer' => 'required|string|max:20',
            'hours' => 'required|integer|min:0',
        ]);
        $level = Level::create($validate);
    }

    public function getLevels(): void
    {
        $levels = Level::all();
    }

    public function updateLevel(Level $level, Request $request): void
    {
        $validate = $request->validate([
            'level_tecnm' => 'required|string|max:20|unique:levels,level_tecnm',
            'level_mcer' => 'required|string|max:20',
            'hours' => 'required|integer|min:0',
        ]);

        $level->update($validate);
    }

    public function deleteLevel(Level $level): void
    {
        $level->delete();
    }
}
