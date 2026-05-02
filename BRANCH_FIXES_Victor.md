# Guía de Correcciones — Rama Victor

Esta guía ofrece código concreto para resolver los problemas P1-P5 identificados en el análisis.

---

## P1: Corregir Acceso de Coordinator a /pagos

**Archivo:** `routes/web.php`  
**Ubicación:** Línea 154  
**Cambio:** Agregar `coordinator` al middleware

### Antes:
```php
Route::middleware('role:admin|student')->group(function () {
    Route::get('/pagos', function () {
        $user = \Illuminate\Support\Facades\Auth::user();
        
        if ($user->hasRole('admin')) {
            // Admin ve todos los servicios
            $services = \App\Models\Service::with('student.user')->orderBy('created_at', 'desc')->get();
        } else {
            // Estudiante ve solo sus propios servicios
            $studentId = $user->student?->id;
            $services = $studentId ? \App\Models\Service::where('student_id', $studentId)->orderBy('created_at', 'desc')->get() : [];
        }
        
        return Inertia::render('Academic/Pagos', [
            'services' => $services,
            'serviceTypes' => \App\Enums\ServiceType::toSelect(),
            'serviceStatuses' => \App\Enums\ServiceStatus::toSelect(),
            'reviewOptions' => \App\Enums\ServiceStatus::reviewOptions(),
        ]);
    })->name('pagos');
});
```

### Después:
```php
Route::middleware('role:admin|student|coordinator')->group(function () {
    Route::get('/pagos', function () {
        $user = \Illuminate\Support\Facades\Auth::user();
        
        if ($user->hasAnyRole(['admin', 'coordinator'])) {
            // Admin y Coordinator ven todos los servicios
            $services = \App\Models\Service::with('student.user')->orderBy('created_at', 'desc')->get();
        } else {
            // Estudiante ve solo sus propios servicios
            $studentId = $user->student?->id;
            $services = $studentId ? \App\Models\Service::where('student_id', $studentId)->orderBy('created_at', 'desc')->get() : [];
        }
        
        return Inertia::render('Academic/Pagos', [
            'services' => $services,
            'serviceTypes' => \App\Enums\ServiceType::toSelect(),
            'serviceStatuses' => \App\Enums\ServiceStatus::toSelect(),
            'reviewOptions' => \App\Enums\ServiceStatus::reviewOptions(),
        ]);
    })->name('pagos');
});
```

**Cambios clave:**
- Línea 154: `'role:admin|student'` → `'role:admin|student|coordinator'`
- Línea 158: `hasRole('admin')` → `hasAnyRole(['admin', 'coordinator'])`

---

## P2: Validar Estatus VALIDATED al Enrolay

**Archivo:** `app/Http/Requests/EnrollStudentsRequest.php`

### Antes:
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EnrollStudentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasAnyRole(['admin']);
    }

    public function rules(): array
    {
        return [
            'student_ids'   => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ];
    }
}
```

### Después:
```php
<?php

namespace App\Http\Requests;

use App\Enums\StudentStatus;
use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class EnrollStudentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasAnyRole(['admin']);
    }

    public function rules(): array
    {
        return [
            'student_ids'   => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ];
    }

    /**
     * Valida que todos los alumnos a enrolay tengan status VALIDATED.
     * Esto asegura que hayan completado el ciclo de validación de pagos.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $studentIds = $this->input('student_ids', []);
            
            // Buscar estudiantes que NO estén VALIDATED
            $invalidStudents = Student::whereIn('id', $studentIds)
                ->where('status', '!=', StudentStatus::VALIDATED->value)
                ->get(['id', 'first_name', 'last_name', 'status']);

            if ($invalidStudents->isNotEmpty()) {
                $names = $invalidStudents
                    ->map(fn($s) => "{$s->first_name} {$s->last_name} ({$s->status->label()})")
                    ->join(', ');
                
                $validator->errors()->add(
                    'student_ids',
                    "Los siguientes alumnos no están validados y no pueden enrolarse: {$names}"
                );
            }
        });
    }
}
```

**Cambios clave:**
- Agregar `use App\Enums\StudentStatus;` al inicio
- Agregar `use Illuminate\Validation\Validator;`
- Agregar método `withValidator()` que valida el estatus

**Nota:** Esta validación se ejecuta automáticamente después de las reglas básicas de validación.

---

## P3: Manejar Período Activo Ausente

**Archivo:** `app/Http/Controllers/ServiceController.php`  
**Ubicación:** Línea 69-87

### Opción A: Permitir NULL (Aceptar limitación)
```php
public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
{
    if (!$this->canReviewServices()) {
        abort(403, 'No autorizado para revisar pagos.');
    }

    $service->update($request->validated());

    $student = $service->student;
    if ($student) {
        if ($request->status === \App\Enums\ServiceStatus::APPROVED->value) {
            $student->update(['status' => \App\Enums\StudentStatus::VALIDATED]);
            
            // Intentar asignar período activo; si no existe, queda NULL
            $activePeriod = \App\Models\Period::where('is_active', true)->first();
            if ($activePeriod) {
                $service->update(['period_id' => $activePeriod->id]);
            } else {
                // Log para visibilidad
                \Log::warning('No existe período activo al aprobar servicio ID=' . $service->id);
            }
        } elseif ($request->status === \App\Enums\ServiceStatus::REJECTED->value) {
            $student->update(['status' => \App\Enums\StudentStatus::WAITING]);
        }
    }

    return back()->with('success', 'Pago actualizado exitosamente.');
}
```

### Opción B: Exigir Período Activo (Más seguro)
```php
public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
{
    if (!$this->canReviewServices()) {
        abort(403, 'No autorizado para revisar pagos.');
    }

    // Validar que exista período activo ANTES de aprobar
    if ($request->status === \App\Enums\ServiceStatus::APPROVED->value) {
        $activePeriod = \App\Models\Period::where('is_active', true)->first();
        if (!$activePeriod) {
            return back()->withErrors([
                'period' => 'No hay un período activo en el sistema. Configure uno antes de aprobar pagos.'
            ]);
        }
    }

    $service->update($request->validated());

    $student = $service->student;
    if ($student) {
        if ($request->status === \App\Enums\ServiceStatus::APPROVED->value) {
            $student->update(['status' => \App\Enums\StudentStatus::VALIDATED]);
            
            $activePeriod = \App\Models\Period::where('is_active', true)->first();
            $service->update(['period_id' => $activePeriod->id]);
        } elseif ($request->status === \App\Enums\ServiceStatus::REJECTED->value) {
            $student->update(['status' => \App\Enums\StudentStatus::WAITING]);
        }
    }

    return back()->with('success', 'Pago actualizado exitosamente.');
}
```

**Recomendación:** Usa Opción B si los períodos activos son críticos; Opción A si tu setup siempre tiene uno.

---

## P4: Validar Retorno de DeleteStudentService

**Archivo:** `app/Http/Controllers/ServiceController.php`  
**Ubicación:** Línea 97-103

### Antes:
```php
public function destroy(Service $service, DeleteStudentService $action): RedirectResponse
{
    // Solo el propietario puede eliminar su pago
    if ($service->student_id !== Auth::user()->student?->id) {
        abort(403, 'No autorizado para eliminar este pago.');
    }

    $action->execute($service);

    return back()->with('success', 'Pago eliminado exitosamente.');
}
```

### Después:
```php
public function destroy(Service $service, DeleteStudentService $action): RedirectResponse
{
    // Solo el propietario puede eliminar su pago
    if ($service->student_id !== Auth::user()->student?->id) {
        abort(403, 'No autorizado para eliminar este pago.');
    }

    $success = $action->execute($service);
    
    if (!$success) {
        return back()->withErrors([
            'delete' => 'No se pudo eliminar el archivo del pago. Contacta a soporte.'
        ]);
    }

    return back()->with('success', 'Pago eliminado exitosamente.');
}
```

---

## P5: Eliminar Modelos/Controllers Vacíos

Si no tiene propósito definido en roadmap inmediato:

### Opción A: Eliminar
```bash
# En terminal
rm app/Models/Payment.php
rm app/Http/Controllers/SelfEnrollmentController.php
# Y eliminar su migración o marcarla como revertida en código
```

### Opción B: Documentar para Futuro
```php
<?php

namespace App\Http\Controllers;

/**
 * Controlador para autoservicio de inscripción de alumnos.
 * 
 * ESTADO: En desarrollo (no productivo aún)
 * 
 * Propósito futuro:
 * - Permitir que alumnos VALIDATED se inscriban automáticamente en grupos
 * - Gestionar autoselección de grupos y exámenes
 * - Reducir carga administrativa
 * 
 * TODO: Implementar cuando se cierre ciclo de validación de pagos
 * 
 * @see EnrollStudentsInGroup (lógica existente a adaptar)
 * @see GroupController::enroll() (referencia de flujo actual)
 */
class SelfEnrollmentController extends Controller
{
    // Por implementar
}
```

**Recomendación:** Usa Opción A (eliminar) si no hay roadmap en 30 días.

---

## Script de Aplicación Rápida

Si quieres aplicar todos estos cambios en orden:

```bash
# 1. Crear rama de fixes
git checkout -b feature/fix-payments-validation

# 2. Aplicar fixes (copiar fragmentos de arriba)
# - routes/web.php (P1)
# - app/Http/Requests/EnrollStudentsRequest.php (P2)
# - app/Http/Controllers/ServiceController.php (P3, P4)
# - Eliminar archivos innecesarios (P5)

# 3. Commit y push
git add .
git commit -m "fix: validate payment status and fix coordinator access to /pagos"
git push origin feature/fix-payments-validation

# 4. Merge en Victor
git checkout Victor
git merge feature/fix-payments-validation
git push origin Victor
```

---

## Verificación Post-Correcciones

Después de aplicar las correcciones, verifica:

```bash
# 1. Sintaxis PHP
php artisan tinker
> exit

# 2. Base de datos (si hay migraciones nuevas)
php artisan migrate:status

# 3. Rutas
php artisan route:list | grep services

# 4. Caché (limpiar si hay caches de rutas)
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

---

**Próximo paso:** Aplicar estas correcciones + tests antes de mergear a main.
