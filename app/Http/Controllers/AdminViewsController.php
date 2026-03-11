<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Degree;
use App\Models\Group;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Level;
use Inertia\Inertia;

class AdminViewsController extends Controller
{
    //

    public function usersView()
    {
        $students = Student::all();
        $teachers = Teacher::all();
        $degrees = Degree::all();
        $levels = Level::all();
        return Inertia::render('TestYochi/Users', [
            'students' => $students,
            'teachers' => $teachers,
            'degrees' => $degrees,
            'levels' => $levels
        ]);
    }

    public function groupsView()
    {
        $grupos = Group::with(['teacher', 'period', 'level'])->get();
        $levels = Level::all();
        return Inertia::render('Test_MK2/Groups', [
            'grupos' => $grupos,
            'levels' => $levels
        ]);
    }
}
