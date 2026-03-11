<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Degree;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Level;
use App\Models\TypeStudent;
use Inertia\Inertia;

class AdminViewsController extends Controller
{
    //

    public function usersView(){
        $students = Student::all();
        $teachers = Teacher::all();
        $degrees = Degree::all();
        $levels = Level::all();
        $type_students = TypeStudent::all();
        return Inertia::render('TestYochi/Users', [
            'students' => $students,
            'teachers' => $teachers,
            'degrees' => $degrees,
            'levels' => $levels,
            'typeStudents' => $type_students
        ]);
    }
}
