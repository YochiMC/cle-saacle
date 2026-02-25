<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Models\Teacher;

class TeacherController extends Controller
{
    public function createTeacher(Request $request): void
    {
        $validate = $request->validate([
            'firstName' => 'required|string|max:100',
            'lastName' => 'required|string|max:100',
            'rfc' => 'required|string|max:13|unique:teachers,rfc',
            'curp' => 'required|string|max:18|unique:teachers,curp',
            'bankName' => 'required|string|max:255',
            'clabe' => 'required|string|max:18|unique:teachers,clabe',
            'ttc_hours' => 'required|integer|min:0',
            'grade' => 'required|string|max:100',
            'is_native' => 'required|boolean',
        ]);

        $teacher = Teacher::create($validate);
    }

    public function updateTeacher(Teacher $teacher, Request $request): void
    {
        $validate = $request->validate([
            'firstName' => 'required|string|max:100',
            'lastName' => 'required|string|max:100',
            'rfc' => 'required|string|max:13|unique:teachers,rfc',
            'curp' => 'required|string|max:18|unique:teachers,curp',
            'bankName' => 'required|string|max:255',
            'clabe' => 'required|string|max:18|unique:teachers,clabe',
            'ttc_hours' => 'required|integer|min:0',
            'grade' => 'required|string|max:100',
            'is_native' => 'required|boolean',
        ]);

        $teacher->update($validate);
    }

    public function getTeachers(): void
    {
        $teachers = Teacher::all();
    }

    public function deleteTeacher(Teacher $teacher): void
    {
        $teacher->delete();
    }
}