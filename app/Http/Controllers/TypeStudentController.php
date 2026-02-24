<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TypeStudent;

class TypeStudentController extends Controller
{
    //
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
