<?php

use App\Http\Controllers\Views\AdminViewsController;
use App\Http\Controllers\DegreeController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login', [
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/kardex', function () {
    return Inertia::render('Test_Vik/Kardex');
})->middleware(['auth', 'verified'])->name('kardex');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/users', [AdminViewsController::class, 'usersView'])->name('users');
    Route::get('/groups', [AdminViewsController::class, 'groupsView'])->name('groups');
    Route::post('/students', [StudentController::class, 'createStudent'])->name('students');
    Route::post('/teachers', [TeacherController::class, 'createTeacher'])->name('teachers');
    Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
    Route::get('/reports', [AdminViewsController::class, 'reportsView'])->name('reports');
    Route::get('/exams', [AdminViewsController::class, 'examsView'])->name('exams.index');
    Route::post('/exams', [\App\Http\Controllers\ExamController::class, 'store'])->name('exams.store');
});

Route::get('/Test', [DegreeController::class, 'getDegree'])->name('Test');

Route::get('/yochi', function () {
    return Inertia::render('Yochi');
})->name('Yochi');

require __DIR__ . '/auth.php';
