<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Degree;
use App\Models\Student;
use Inertia\Inertia;

class DegreeController extends Controller
{
    //
    public function createDegree(Request $request): void
    {
        $validate = $request->validate([
            'name' => 'required|string|max:100|unique:degrees,name',
            'curriculum' => 'required|string|max:30|unique:degrees,curriculum'
        ]);
        $degree = Degree::create($validate);
    }

    public function getDegree()
    {
        $degrees = Degree::all();
        $students = Student::all();
        return Inertia::render('Degrees', [
            'degrees' => $degrees,
            'students' => $students
        ]);
    }

    public function updateDegree(Degree $degree, Request $request): void
    {
        $validate = $request->validate([
            'name' => 'required|string|max:100|unique:degrees,name',
            'curriculum' => 'required|string|max:30|unique:degrees,curriculum'
        ]);
        $degree->update($validate);
    }

    public function deleteDegree(Degree $degree): void
    {
        $degree->delete();
    }
}
