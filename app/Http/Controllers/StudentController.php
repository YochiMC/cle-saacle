<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    //
    public function createStudent(Request $request): void
    {
        $validate = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'numControl' => 'required|string|max:20|unique:students,numControl',
            'gender' => 'required|char|in:M,F',
            'birthDate' => 'required|date',
            'semester' => 'required|integer|min:0|max:13',
            'degree_id' => 'required|exists:degrees,id',
            'type_student_id' => 'required|exists:type_students,id',
            'level_id' => 'required|exists:levels,id',
        ]);
        $student = Student::create($validate);
    }

    public function getStudents(): void
    {
        $students = Student::all();
    }

    public function updateStudent(Student $student, Request $request): void
    {
        $validate = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'numControl' => 'required|string|max:20|unique:students,numControl',
            'gender' => 'required|char|in:M,F',
            'birthDate' => 'required|date',
            'semester' => 'required|integer|min:0|max:13',
            'degree_id' => 'required|exists:degrees,id',
            'type_student_id' => 'required|exists:type_students,id',
            'level_id' => 'required|exists:levels,id',
        ]);

        $student->update($validate);
    }

    public function deleteStudent(Student $student): void
    {
        $student->delete();
    }
}
