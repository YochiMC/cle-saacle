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
    return Inertia::render('Academic/Kardex');
})->middleware(['auth', 'verified'])->name('kardex');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/users', [AdminViewsController::class, 'usersView'])->name('users');
    Route::get('/groups', [AdminViewsController::class, 'groupsView'])->name('groups');
    Route::get('/profiles/{user}', [ProfileController::class, 'show'])->name('profiles');
    Route::get('/profiles/{user}/kardex', [ProfileController::class, 'kardex'])->name('profiles.kardex');
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
    Route::patch('/groups/{group}/update-units', [GroupController::class, 'updateUnits'])->name('groups.update-units');
    Route::patch('/groups/{group}/complete', [GroupController::class, 'complete'])->name('groups.complete');
    Route::get('/reports', [AdminViewsController::class, 'reportsView'])->name('reports');
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
    Route::put('/documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
    Route::get('/exams', [AdminViewsController::class, 'examsView'])->name('exams.index');
    Route::post('/exams', [\App\Http\Controllers\ExamController::class, 'store'])->name('exams.store');
    Route::put('/exams/{exam}', [App\Http\Controllers\ExamController::class, 'update'])->name('exams.update');
    Route::delete('/exams/{exam}', [App\Http\Controllers\ExamController::class, 'destroy'])->name('exams.destroy');
    Route::post('/exams/bulk-status', [\App\Http\Controllers\ExamController::class, 'bulkStatus'])->name('exams.bulk-status');
    Route::delete('/exams/bulk-delete', [\App\Http\Controllers\ExamController::class, 'bulkDelete'])->name('exams.bulk-delete');
    
    // Rutas de gestión de un solo examen (clon de grupos)
    Route::get('/exams/{exam}/detalles', [\App\Http\Controllers\ExamController::class, 'show'])->name('exams.show');
    Route::post('/exams/{exam}/enroll', [\App\Http\Controllers\ExamController::class, 'enroll'])->name('exams.enroll');
    Route::delete('/exams/{exam}/unenroll/{student}', [\App\Http\Controllers\ExamController::class, 'unenroll'])->name('exams.unenroll');
    Route::post('/exams/{exam}/unenroll-bulk', [\App\Http\Controllers\ExamController::class, 'bulkUnenroll'])->name('exams.unenroll-bulk');
    Route::patch('/exams/{exam}/qualifications/bulk', [\App\Http\Controllers\ExamController::class, 'bulkUpdatePivot'])->name('exams.qualifications.bulk-update');
    Route::patch('/exams/{exam}/qualifications/{student}', [\App\Http\Controllers\ExamController::class, 'updatePivot'])->name('exams.qualifications.update');
    Route::patch('/exams/{exam}/complete', [\App\Http\Controllers\ExamController::class, 'complete'])->name('exams.complete');

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
    return Inertia::render('RecursosYochi/Yochi');
})->name('Yochi');

require __DIR__ . '/auth.php';
