<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Teacher;

class TestController extends Controller
{
    //
    public function test(Request $request):void{

    $validate = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'phone' => 'required|string|max:15',
        'password' => 'required|string|min:8',
    ]);

        $teacher = Teacher::create($validate);
    }
}
