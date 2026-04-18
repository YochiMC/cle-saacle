    <?php

use App\Http\Controllers\AccreditationController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\Views\AdminViewsController;
use App\Http\Controllers\PeriodController;
use App\Http\Controllers\LevelController;
use App\Http\Controllers\DegreeController;
use App\Http\Controllers\TypeStudentController;
use App\Http\Controllers\CatalogUIController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login', [
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {

    // Perfil propio (cualquier usuario autenticado y verificado)
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // Documentos personales (el controlador resuelve permisos finos por propietario/rol)
    Route::prefix('documents')->group(function () {
        Route::post('/', [DocumentController::class, 'store'])->name('documents.store');
        Route::get('/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
        Route::delete('/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
    });

    // Actualización de revisión de documentos (admin/coordinator)
    Route::prefix('documents')->middleware('role:admin|coordinator')->group(function () {
        Route::put('/{document}', [DocumentController::class, 'update'])->name('documents.update');
    });

    // Vistas y operaciones compartidas por roles base del sistema (menú principal)
    Route::middleware('role:admin|teacher|student')->group(function () {
        Route::get('/dashboard', function () {
            $students = \App\Http\Resources\StudentResource::collection(\App\Models\Student::with(['degree', 'level', 'typeStudent'])->get())->resolve();
            $teachers = \App\Http\Resources\TeacherResource::collection(\App\Models\Teacher::all())->resolve();
            $degrees = \App\Models\Degree::all();
            $levels = \App\Models\Level::all();
            $type_students = \App\Models\TypeStudent::all();
            $groups = \App\Models\Group::all();

            return Inertia::render('Dashboard', [
                'students' => $students,
                'teachers' => $teachers,
                'degrees' => $degrees,
                'levels' => $levels,
                'groups' => $groups,
                'typeStudents' => $type_students,
            ]);
        })->name('dashboard');

        Route::get('/kardex', function () {
            return Inertia::render('Academic/Kardex');
        })->name('kardex');

        Route::get('/groups', [AdminViewsController::class, 'groupsView'])->name('groups');

        Route::prefix('groups')->group(function () {
            Route::get('/{group}/detalles', [GroupController::class, 'show'])->name('groups.show');
            Route::post('/{group}/enroll', [GroupController::class, 'enroll'])->name('groups.enroll');
            Route::delete('/{group}/unenroll/{student}', [GroupController::class, 'unenroll'])->name('groups.unenroll');
            Route::post('/{group}/unenroll-bulk', [GroupController::class, 'bulkUnenroll'])->name('groups.unenroll-bulk');
        });

        // Alias legacy para mantener compatibilidad temporal con endpoints en español.
        Route::prefix('grupos')->group(function () {
            Route::get('/{group}/detalles', [GroupController::class, 'show']);
        });

        Route::prefix('exams')->group(function () {
            Route::get('/', [AdminViewsController::class, 'examsView'])->name('exams.index');
            Route::get('/{exam}/detalles', [\App\Http\Controllers\ExamController::class, 'show'])->name('exams.show');
            Route::post('/{exam}/enroll', [\App\Http\Controllers\ExamController::class, 'enroll'])->name('exams.enroll');
            Route::delete('/{exam}/unenroll/{student}', [\App\Http\Controllers\ExamController::class, 'unenroll'])->name('exams.unenroll');
            Route::post('/{exam}/unenroll-bulk', [\App\Http\Controllers\ExamController::class, 'bulkUnenroll'])->name('exams.unenroll-bulk');
        });
    });

    // Vistas y operaciones para admin + teacher
    Route::middleware('role:admin|teacher')->group(function () {
        Route::get('/reports', [AdminViewsController::class, 'reportsView'])->name('reports');

        Route::prefix('acreditaciones')->group(function () {
            Route::get('/', [AccreditationController::class, 'index'])->name('accreditations');
            Route::post('/bulk-suspend', [AccreditationController::class, 'bulkSuspend'])->name('accreditations.bulk-suspend');
            Route::patch('/{student}/status', [AccreditationController::class, 'updateStatus'])->name('accreditations.update-status');
        });

        Route::prefix('groups')->group(function () {
            Route::post('/', [GroupController::class, 'store'])->name('groups.store');
            Route::put('/{group}', [GroupController::class, 'update'])->name('groups.update');
            Route::delete('/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');
            Route::put('/bulk-status', [GroupController::class, 'bulkUpdateStatus'])->name('groups.bulk-status');
            Route::delete('/bulk-delete', [GroupController::class, 'bulkDestroy'])->name('groups.bulk-delete');
            Route::patch('/{group}/update-units', [GroupController::class, 'updateUnits'])->name('groups.update-units');
            Route::patch('/{group}/complete', [GroupController::class, 'complete'])->name('groups.complete');
        });

        // Alias legacy para endpoints de operación masiva en español.
        Route::prefix('grupos')->group(function () {
            Route::put('/bulk-status', [GroupController::class, 'bulkUpdateStatus']);
            Route::delete('/bulk-delete', [GroupController::class, 'bulkDestroy']);
        });

        Route::prefix('qualifications')->group(function () {
            Route::patch('/bulk-update', [\App\Http\Controllers\QualificationController::class, 'bulkUpdate'])->name('qualifications.bulk-update');
            Route::patch('/{qualification}', [\App\Http\Controllers\QualificationController::class, 'update'])->name('qualifications.update');
        });

        Route::prefix('exams')->group(function () {
            Route::post('/', [\App\Http\Controllers\ExamController::class, 'store'])->name('exams.store');
            Route::post('/bulk-status', [\App\Http\Controllers\ExamController::class, 'bulkStatus'])->name('exams.bulk-status');
            Route::delete('/bulk-delete', [\App\Http\Controllers\ExamController::class, 'bulkDelete'])->name('exams.bulk-delete');
            Route::patch('/{exam}/qualifications/bulk', [\App\Http\Controllers\ExamController::class, 'bulkUpdatePivot'])->name('exams.qualifications.bulk-update');
            Route::patch('/{exam}/qualifications/{student}', [\App\Http\Controllers\ExamController::class, 'updatePivot'])->name('exams.qualifications.update');
            Route::patch('/{exam}/complete', [\App\Http\Controllers\ExamController::class, 'complete'])->name('exams.complete');
            Route::put('/{exam}', [App\Http\Controllers\ExamController::class, 'update'])->name('exams.update');
            Route::delete('/{exam}', [App\Http\Controllers\ExamController::class, 'destroy'])->name('exams.destroy');
        });
    });

    // Vistas para admin + student (según menú principal)
    Route::middleware('role:admin|student')->group(function () {
        Route::get('/pagos', function () {
            return Inertia::render('Academic/Pagos');
        })->name('pagos');
    });

    // Operaciones administrativas exclusivas de admin
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [AdminViewsController::class, 'usersView'])->name('users');

        Route::prefix('students')->group(function () {
            Route::post('/', [StudentController::class, 'createStudent'])->name('students');
            Route::delete('/bulk-delete', [StudentController::class, 'bulkDeleteStudents'])->name('students.bulk-delete');
            Route::put('/{student}', [StudentController::class, 'updateStudent'])->name('students.update');
            Route::delete('/{student}', [StudentController::class, 'deleteStudent'])->name('students.delete');
        });

        Route::prefix('teachers')->group(function () {
            Route::post('/', [TeacherController::class, 'createTeacher'])->name('teachers');
            Route::delete('/bulk-delete', [TeacherController::class, 'bulkDeleteTeachers'])->name('teachers.bulk-delete');
            Route::put('/{teacher}', [TeacherController::class, 'updateTeacher'])->name('teachers.update');
            Route::delete('/{teacher}', [TeacherController::class, 'deleteTeacher'])->name('teachers.delete');
        });

        Route::prefix('profiles')->group(function () {
            Route::get('/{user}', [ProfileController::class, 'show'])->name('profiles');
            Route::get('/{user}/kardex', [ProfileController::class, 'kardex'])->name('profiles.kardex');
            Route::delete('/{user}', [ProfileController::class, 'delete'])->name('profiles.delete');
        });

        Route::prefix('password')->group(function () {
            Route::put('/{user}', [PasswordController::class, 'updatePassword'])->name('users.password.update');
        });

        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index'])->name('roles.index');
            Route::post('/', [RoleController::class, 'store'])->name('roles.store');
            Route::put('/{id}', [RoleController::class, 'update'])->name('roles.update');
            Route::delete('/{id}', [RoleController::class, 'destroy'])->name('roles.destroy');
        });

        // ── Configuraciones del Sistema (sólo Administradores) ─────────────────
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [SettingController::class, 'index'])->name('index');
            Route::put('/bulk', [SettingController::class, 'updateBulk'])->name('update-bulk');
            
            // UI Centralizada de Catálogos
            Route::get('/catalogs', [CatalogUIController::class, 'index'])->name('catalogs');
        });

        // Rutas Bulk Delete para Catálogos
        Route::delete('periods/bulk', [PeriodController::class, 'bulkDestroy'])->name('periods.bulk-delete');
        Route::delete('levels/bulk', [LevelController::class, 'bulkDestroy'])->name('levels.bulk-delete');
        Route::delete('degrees/bulk', [DegreeController::class, 'bulkDestroy'])->name('degrees.bulk-delete');
        Route::delete('type-students/bulk', [TypeStudentController::class, 'bulkDestroy'])->name('type-students.bulk-delete');

        // Mutaciones de Catálogos (Thin Controllers)
        Route::apiResource('periods', PeriodController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('levels', LevelController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('degrees', DegreeController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('type-students', TypeStudentController::class)->only(['store', 'update', 'destroy'])->parameters([
            'type-students' => 'typeStudent'
        ]);
    });
});

require __DIR__.'/auth.php';
