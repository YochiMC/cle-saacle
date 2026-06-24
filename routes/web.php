<?php

use App\Http\Controllers\AccreditationController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\CatalogUIController;
use App\Http\Controllers\CertificateVerificationController;
use App\Http\Controllers\DegreeController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\LegacyQualificationController;
use App\Http\Controllers\LevelController;
use App\Http\Controllers\PeriodController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SelfEnrollmentController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\Views\AdminViewsController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/', [AuthenticatedSessionController::class, 'create']);
});

// Ruta PÚBLICA para verificar constancias via QR (sin autenticación)
Route::get('/verificar-constancia/{code}', [CertificateVerificationController::class, 'verify'])
    ->name('certificates.verify');

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
        Route::get('/{document}/preview', [DocumentController::class, 'preview'])->name('documents.preview');
        Route::get('/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
        Route::delete('/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
    });

    // Actualización de revisión de documentos (admin/coordinator)
    Route::prefix('documents')->middleware('role:admin|coordinator')->group(function () {
        Route::put('/{document}', [DocumentController::class, 'update'])->name('documents.update');
    });

    // Pagos/Servicios personales (estudiante/admin/coordinator)
    Route::prefix('services')->group(function () {
        Route::post('/', [\App\Http\Controllers\ServiceController::class, 'store'])->name('services.store');
        Route::get('/{service}/preview', [\App\Http\Controllers\ServiceController::class, 'preview'])->name('services.preview');
        Route::get('/{service}/download', [\App\Http\Controllers\ServiceController::class, 'download'])->name('services.download');
        Route::delete('/{service}', [\App\Http\Controllers\ServiceController::class, 'destroy'])->name('services.destroy');
    });

    // Actualización de revisión de pagos (admin/coordinator)
    Route::prefix('services')->middleware('role:admin|coordinator')->group(function () {
        Route::put('/{service}', [\App\Http\Controllers\ServiceController::class, 'update'])->name('services.update');
    });

    // Vistas y operaciones compartidas por roles base del sistema (menú principal)
    Route::middleware('role:admin|coordinator|teacher|student')->group(function () {
        Route::get('/dashboard', [AdminViewsController::class, 'dashboardView'])->name('dashboard');

        Route::get('/groups', [AdminViewsController::class, 'groupsView'])->name('groups');

        Route::prefix('groups')->group(function () {
            Route::middleware('role:admin|coordinator|teacher|student')->group(function () {
                Route::get('/{group}/detalles', [GroupController::class, 'show'])->name('groups.show');
            });

            Route::middleware('role:admin|coordinator|student')->group(function () {
                Route::delete('/{group}/unenroll/{student}', [GroupController::class, 'unenroll'])->name('groups.unenroll');
            });

            Route::middleware('role:admin|coordinator')->group(function () {
                Route::post('/{group}/enroll', [GroupController::class, 'enroll'])->name('groups.enroll');
            });

            Route::middleware('role:admin|coordinator')->group(function () {
                Route::post('/{group}/unenroll-bulk', [GroupController::class, 'bulkUnenroll'])->name('groups.unenroll-bulk');
            });
        });

        // Alias legacy para mantener compatibilidad temporal con endpoints en español.
        Route::prefix('grupos')->group(function () {
            Route::middleware('role:admin|coordinator|teacher')->group(function () {
                Route::get('/{group}/detalles', [GroupController::class, 'show']);
            });
        });

        Route::prefix('exams')->group(function () {
            Route::get('/', [AdminViewsController::class, 'examsView'])->name('exams.index');
            Route::get('/{exam}/detalles', [\App\Http\Controllers\ExamController::class, 'show'])->name('exams.show');
            Route::post('/{exam}/enroll', [\App\Http\Controllers\ExamController::class, 'enroll'])->name('exams.enroll');
            Route::delete('/{exam}/unenroll/{student}', [\App\Http\Controllers\ExamController::class, 'unenroll'])->name('exams.unenroll');
            Route::post('/{exam}/unenroll-bulk', [\App\Http\Controllers\ExamController::class, 'bulkUnenroll'])->name('exams.unenroll-bulk');
        });
    });

    // Vistas y operaciones para admin + coordinator (Reportes)
    Route::middleware('role:admin|coordinator')->group(function () {
        Route::get('/reports', [AdminViewsController::class, 'reportsView'])->name('reports');
    });

    // Vistas y operaciones para admin + teacher + coordinator
    Route::middleware('role:admin|teacher|coordinator')->group(function () {

        Route::prefix('acreditaciones')->group(function () {
            Route::middleware('role:admin')->group(function () {
                Route::get('/', [AccreditationController::class, 'index'])->name('accreditations');
                Route::post('/bulk-suspend', [AccreditationController::class, 'bulkSuspend'])->name('accreditations.bulk-suspend');
                Route::patch('/{student}/status', [AccreditationController::class, 'updateStatus'])->name('accreditations.update-status');
            });
            Route::get('/{student}/constancia/preview', [AccreditationController::class, 'previewCertificate'])
                ->middleware('role:admin|coordinator')
                ->name('accreditations.preview');

            Route::get('/{student}/constancia', [AccreditationController::class, 'generateCertificate'])
                ->middleware('role:admin')
                ->name('accreditations.certificate');

            // Personalización de constancias (nuevo)
            Route::get('/customize/{certificate}', [AccreditationController::class, 'customizeCertificate'])
                ->middleware('role:admin|coordinator')
                ->name('certificates.customize');

            Route::post('/customize/{certificate}/confirm', [AccreditationController::class, 'confirmCustomization'])
                ->middleware('role:admin|coordinator')
                ->name('certificates.confirm-customization');

            Route::get('/customize/{certificate}/download', [AccreditationController::class, 'downloadCertificate'])
                ->middleware('role:admin|coordinator')
                ->name('certificates.download');

            Route::get('/customize/{certificate}/download-word', [AccreditationController::class, 'downloadWordCertificate'])
                ->middleware('role:admin|coordinator')
                ->name('certificates.download-word');

            Route::get('/customize/{certificate}/download-word-all', [AccreditationController::class, 'downloadWordAllTypes'])
                ->middleware('role:admin|coordinator')
                ->name('certificates.download-word-all');

            Route::post('/customize/{certificate}/preview-live', [AccreditationController::class, 'previewLive'])
                ->middleware('role:admin|coordinator')
                ->name('certificates.preview-live');
        });

        Route::prefix('groups')->group(function () {
            Route::post('/', [GroupController::class, 'store'])->name('groups.store');
            Route::put('/bulk-status', [GroupController::class, 'bulkUpdateStatus'])->name('groups.bulk-status');
            Route::delete('/bulk-delete', [GroupController::class, 'bulkDestroy'])->name('groups.bulk-delete');
            Route::put('/{group}', [GroupController::class, 'update'])->name('groups.update');
            Route::delete('/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');
            Route::patch('/{group}/update-units', [GroupController::class, 'updateUnits'])->name('groups.update-units');
            Route::patch('/{group}/complete', [GroupController::class, 'complete'])->name('groups.complete');

            // Calificaciones (Nested)
            Route::patch('/{group}/qualifications/bulk', [\App\Http\Controllers\QualificationController::class, 'bulkUpdate'])->name('groups.qualifications.bulk-update');
            Route::patch('/{group}/qualifications/{qualification}', [\App\Http\Controllers\QualificationController::class, 'update'])->name('groups.qualifications.update');
        });

        // Alias legacy para endpoints de operación masiva en español.
        Route::prefix('grupos')->group(function () {
            Route::put('/bulk-status', [GroupController::class, 'bulkUpdateStatus']);
            Route::delete('/bulk-delete', [GroupController::class, 'bulkDestroy']);
        });

        Route::prefix('exams')->group(function () {
            Route::post('/', [\App\Http\Controllers\ExamController::class, 'store'])->name('exams.store');
            Route::post('/bulk-status', [\App\Http\Controllers\ExamController::class, 'bulkStatus'])->name('exams.bulk-status');
            Route::delete('/bulk-delete', [\App\Http\Controllers\ExamController::class, 'bulkDelete'])->name('exams.bulk-delete');
            Route::patch('/{exam}/qualifications/bulk', [\App\Http\Controllers\ExamController::class, 'bulkUpdatePivot'])->name('exams.qualifications.bulk-update');
            Route::patch('/{exam}/qualifications/{student}', [\App\Http\Controllers\ExamController::class, 'updatePivot'])->name('exams.qualifications.update');
            Route::patch('/{exam}/complete', [\App\Http\Controllers\ExamController::class, 'complete'])->name('exams.complete');
            Route::put('/{exam}', [\App\Http\Controllers\ExamController::class, 'update'])->name('exams.update');
            Route::delete('/{exam}', [\App\Http\Controllers\ExamController::class, 'destroy'])->name('exams.destroy');
        });
    });

    // Operaciones de grupos para admin + coordinator
    Route::middleware('role:admin|coordinator')->group(function () {
        Route::prefix('groups')->group(function () {
            Route::post('/', [GroupController::class, 'store'])->name('groups.store');
            Route::put('/{group}', [GroupController::class, 'update'])->name('groups.update');
            Route::delete('/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');
            Route::put('/bulk-status', [GroupController::class, 'bulkUpdateStatus'])->name('groups.bulk-status');
            Route::delete('/bulk-delete', [GroupController::class, 'bulkDestroy'])->name('groups.bulk-delete');
        });

        // Alias legacy para endpoints de operación masiva en español.
        Route::prefix('grupos')->group(function () {
            Route::put('/bulk-status', [GroupController::class, 'bulkUpdateStatus']);
            Route::delete('/bulk-delete', [GroupController::class, 'bulkDestroy']);
        });
    });

    // Operaciones de grupos para admin + coordinator + teacher
    Route::middleware('role:admin|coordinator|teacher')->group(function () {
        Route::prefix('groups')->group(function () {
            Route::patch('/{group}/update-units', [GroupController::class, 'updateUnits'])->name('groups.update-units');
            Route::patch('/{group}/complete', [GroupController::class, 'complete'])->name('groups.complete');
        });
    });

    // Vistas para admin + coordinator + student (según menú principal)
    Route::middleware('role:admin|coordinator|student')->group(function () {
        Route::get('/pagos', [AdminViewsController::class, 'servicesView'])->name('pagos');
        Route::get('/kardex/{user}', [AdminViewsController::class, 'kardex'])->name('kardex');
        Route::get('/kardex/{user}/pdf', [AdminViewsController::class, 'downloadKardexPdf'])->name('kardex.pdf');
    });

    // Autoinscripción de estudiante a grupos
    Route::middleware('role:student')->group(function () {
        Route::get('/inscripcion', [AdminViewsController::class, 'studentEnrollmentView'])->name('student.enrollment');
        Route::post('/grupos/{group}/auto-inscribir', [SelfEnrollmentController::class, 'enroll'])->name('self-enroll');
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
            Route::delete('/{user}', [ProfileController::class, 'delete'])->name('profiles.delete');

            // CRUD de Calificaciones Históricas (OG) — anidadas bajo el contexto del usuario
            Route::post('/{user}/legacy-qualifications', [LegacyQualificationController::class, 'store'])
                ->name('legacy-qualifications.store');
            Route::put('/{user}/legacy-qualifications/{legacy}', [LegacyQualificationController::class, 'update'])
                ->name('legacy-qualifications.update');
            Route::delete('/{user}/legacy-qualifications/{legacy}', [LegacyQualificationController::class, 'destroy'])
                ->name('legacy-qualifications.destroy');
        });

        Route::prefix('password')->group(function () {
            Route::put('/{user}', [PasswordController::class, 'updatePassword'])->name('users.password.update');
        });

        Route::prefix('roles')->group(function () {
            if (! app()->isProduction()) {
                Route::get('/', [RoleController::class, 'index'])->name('roles.index');
            }

            Route::post('/', [RoleController::class, 'store'])->name('roles.store');
            Route::put('/{id}', [RoleController::class, 'update'])->name('roles.update');
            Route::delete('/{id}', [RoleController::class, 'destroy'])->name('roles.destroy');
        });
    });

    // Operaciones de configuración y catálogo para admin + coordinator
    Route::middleware('role:admin|coordinator')->group(function () {
        // ── Configuraciones del Sistema (Administrador y Coordinador) ───────────
        if (! app()->isProduction()) {
            Route::prefix('settings')->name('settings.')->group(function () {
                Route::get('/', [SettingController::class, 'index'])->name('index');
                Route::put('/bulk', [SettingController::class, 'updateBulk'])->name('update-bulk');
            });
        }

        Route::prefix('settings')->name('settings.')->group(function () {
            // UI Centralizada de Catálogos
            Route::get('/catalogs', [CatalogUIController::class, 'index'])->name('catalogs');
        });

        Route::delete('periods/bulk', [PeriodController::class, 'bulkDestroy'])->name('periods.bulk-delete');
        Route::delete('levels/bulk', [LevelController::class, 'bulkDestroy'])->name('levels.bulk-delete');
        Route::delete('degrees/bulk', [DegreeController::class, 'bulkDestroy'])->name('degrees.bulk-delete');

        Route::apiResource('periods', PeriodController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('levels', LevelController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('degrees', DegreeController::class)->only(['store', 'update', 'destroy']);
    });
});

require __DIR__ . '/auth.php';