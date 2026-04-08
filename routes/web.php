<?php

use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\DegreeController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\Views\AdminViewsController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\DocumentController;
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
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
    Route::prefix('exams')->name('exams.')->controller(\App\Http\Controllers\ExamController::class)->group(function () {
        // 1. Rutas estáticas y acciones masivas (Prioridad Alta)
        Route::post('/bulk-status', 'bulkStatus')->name('bulk-status');
        Route::delete('/bulk-delete', 'bulkDelete')->name('bulk-delete');
        Route::get('/', [\App\Http\Controllers\Views\AdminViewsController::class, 'examsView'])->name('index');

        // 2. Rutas CRUD base
        Route::post('/', 'store')->name('store');

        // 3. Rutas dinámicas con parámetros (Prioridad Baja)
        Route::put('/{exam}', 'update')->name('update');
        Route::delete('/{exam}', 'destroy')->name('destroy');
        Route::get('/{exam}/detalles', 'show')->name('show');
        Route::post('/{exam}/enroll', 'enroll')->name('enroll');
        Route::delete('/{exam}/unenroll/{student}', 'unenroll')->name('unenroll');
        Route::post('/{exam}/unenroll-bulk', 'bulkUnenroll')->name('unenroll-bulk');
        Route::patch('/{exam}/qualifications', 'updatePivot')->name('qualifications.update');
        Route::patch('/{exam}/qualifications-bulk', 'bulkUpdatePivot')->name('qualifications.bulk-update');
    });

    Route::put('/password/{user}', [PasswordController::class, 'updatePassword'])->name('users.password.update');
    Route::delete('/profiles/{user}', [ProfileController::class, 'delete'])->name('profiles.delete');
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->name('roles.destroy');
    Route::put('/roles/{id}', [RoleController::class, 'update'])->name('roles.update');

    // ── Configuraciones del Sistema (sólo Administradores) ─────────────────
    Route::prefix('settings')->name('settings.')->middleware('role:admin')->group(function () {
        Route::get('/', [SettingController::class, 'index'])->name('index');
        Route::put('/bulk', [SettingController::class, 'updateBulk'])->name('update-bulk');
    });
});

Route::get('/Test', [DegreeController::class, 'getDegree'])->name('Test');

Route::get('/yochi', function () {
    return Inertia::render('Yochi');
})->name('Yochi');

require __DIR__ . '/auth.php';
