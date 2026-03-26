<?php

use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\DegreeController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\Views\AdminViewsController;
use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Route;
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
    Route::get('/profiles/{user}', [ProfileController::class, 'show'])->name('profiles');
    Route::post('/students', [StudentController::class, 'createStudent'])->name('students');
    Route::put('/students/{student}', [StudentController::class, 'updateStudent'])->name('students.update');
    Route::delete('/students/{student}', [StudentController::class, 'deleteStudent'])->name('students.delete');
    Route::post('/teachers', [TeacherController::class, 'createTeacher'])->name('teachers');
    Route::put('/teachers/{teacher}', [TeacherController::class, 'updateTeacher'])->name('teachers.update');
    Route::delete('/teachers/{teacher}', [TeacherController::class, 'deleteTeacher'])->name('teachers.delete');
    Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
    Route::put('/groups/{group}', [GroupController::class, 'update'])->name('groups.update');
    Route::delete('/groups/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');
    Route::patch('/qualifications/bulk-update', [\App\Http\Controllers\QualificationController::class, 'bulkUpdate'])->name('qualifications.bulk-update');
    Route::patch('/qualifications/{qualification}', [\App\Http\Controllers\QualificationController::class, 'update'])->name('qualifications.update');
    Route::put('/grupos/bulk-status', [GroupController::class, 'bulkUpdateStatus'])->name('groups.bulk-status');
    Route::delete('/grupos/bulk-delete', [GroupController::class, 'bulkDestroy'])->name('groups.bulk-delete');
    Route::get('/grupos/{group}/detalles', [GroupController::class, 'show'])->name('groups.show');
    Route::post('/groups/{group}/enroll', [\App\Http\Controllers\GroupController::class, 'enroll'])->name('groups.enroll');
    Route::delete('/groups/{group}/unenroll/{student}', [GroupController::class, 'unenroll'])->name('groups.unenroll');
    Route::post('/groups/{group}/unenroll-bulk', [GroupController::class, 'bulkUnenroll'])->name('groups.unenroll-bulk');
    Route::get('/reports', [AdminViewsController::class, 'reportsView'])->name('reports');
    Route::get('/exams', [AdminViewsController::class, 'examsView'])->name('exams.index');
    Route::post('/exams', [\App\Http\Controllers\ExamController::class, 'store'])->name('exams.store');
    Route::put('/password/{user}', [PasswordController::class, 'updatePassword'])->name('users.password.update');
    Route::delete('/profiles/{user}', [ProfileController::class, 'delete'])->name('profiles.delete');
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
});

Route::get('/Test', [DegreeController::class, 'getDegree'])->name('Test');

Route::get('/yochi', function () {
    return Inertia::render('Yochi');
})->name('Yochi');

require __DIR__.'/auth.php';
