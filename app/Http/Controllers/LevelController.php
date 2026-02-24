<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Level;

class LevelController extends Controller
{
    //
    public function createLevel(Request $request): void
    {
        $validate = $request->validate([
            'levelTecnm' => 'required|string|max:20|unique:levels,levelTecnm',
            'levelMCER' => 'required|string|max:20',
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
            'levelTecnm' => 'required|string|max:20|unique:levels,levelTecnm',
            'levelMCER' => 'required|string|max:20',
            'hours' => 'required|integer|min:0',
        ]);

        $level->update($validate);
    }

    public function deleteLevel(Level $level): void
    {
        $level->delete();
    }
}
