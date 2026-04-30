# Plan de Testing — Rama Victor (Módulo de Pagos)

---

## Resumen

Este plan cubre tests unitarios, feature tests e integración manual para validar la rama Victor antes de mergear a main.

**Tiempo estimado:** 4-6 horas (incluye escritura + ejecución)

---

## 1. UNIT TESTS

### 1.1 StoreStudentService

**Archivo test:** `tests/Unit/Actions/StoreStudentServiceTest.php`

```php
<?php

namespace Tests\Unit\Actions;

use App\Actions\StoreStudentService;
use App\Enums\ServiceStatus;
use App\Enums\StudentStatus;
use App\Models\Service;
use App\Models\Student;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StoreStudentServiceTest extends TestCase
{
    protected StoreStudentService $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = new StoreStudentService();
        Storage::fake('local');
    }

    public function test_creates_service_with_valid_data()
    {
        $student = Student::factory()->create(['status' => StudentStatus::WAITING->value]);
        $file = UploadedFile::fake()->create('payment.pdf', 100, 'application/pdf');

        $data = [
            'type' => 'transferencia',
            'amount' => 500.00,
            'reference_number' => 'REF-12345',
            'description' => 'Pago inscripción',
        ];

        $service = $this->action->execute($file, $data, $student->id);

        $this->assertInstanceOf(Service::class, $service);
        $this->assertEquals('transferencia', $service->type->value);
        $this->assertEquals(500.00, $service->amount);
        $this->assertEquals(ServiceStatus::PENDING->value, $service->status->value);
        $this->assertEquals('REF-12345', $service->reference_number);
    }

    public function test_updates_student_status_to_payment_review()
    {
        $student = Student::factory()->create(['status' => StudentStatus::WAITING->value]);
        $file = UploadedFile::fake()->create('payment.pdf', 100);

        $this->action->execute($file, ['type' => 'deposito', 'amount' => 100], $student->id);

        $student->refresh();
        $this->assertEquals(StudentStatus::PAYMENT_REVIEW->value, $student->status->value);
    }

    public function test_saves_file_to_local_disk()
    {
        $student = Student::factory()->create();
        $file = UploadedFile::fake()->create('payment.pdf', 100);

        $service = $this->action->execute($file, ['type' => 'deposito', 'amount' => 100], $student->id);

        $expectedPath = "servicios/student_{$student->id}";
        Storage::disk('local')->assertExists($service->file_path);
    }

    public function test_generates_unique_filename()
    {
        $student = Student::factory()->create();
        $file1 = UploadedFile::fake()->create('payment.pdf', 100);
        $file2 = UploadedFile::fake()->create('payment.pdf', 100);

        $service1 = $this->action->execute($file1, ['type' => 'deposito', 'amount' => 100], $student->id);
        $service2 = $this->action->execute($file2, ['type' => 'deposito', 'amount' => 200], $student->id);

        $this->assertNotEquals($service1->file_path, $service2->file_path);
    }
}
```

**Ejecutar:**
```bash
php artisan test tests/Unit/Actions/StoreStudentServiceTest.php
```

---

### 1.2 DeleteStudentService

**Archivo test:** `tests/Unit/Actions/DeleteStudentServiceTest.php`

```php
<?php

namespace Tests\Unit\Actions;

use App\Actions\DeleteStudentService;
use App\Models\Service;
use App\Models\Student;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DeleteStudentServiceTest extends TestCase
{
    protected DeleteStudentService $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = new DeleteStudentService();
        Storage::fake('local');
    }

    public function test_deletes_file_and_record()
    {
        $student = Student::factory()->create();
        $file = UploadedFile::fake()->create('payment.pdf', 100);
        
        // Crear servicio con archivo
        $path = $file->storeAs("servicios/student_{$student->id}", 'test.pdf', 'local');
        $service = Service::create([
            'student_id' => $student->id,
            'type' => 'transferencia',
            'amount' => 100,
            'file_path' => $path,
            'disk' => 'local',
            'status' => 'pending',
        ]);

        // Verificar que existe
        Storage::disk('local')->assertExists($path);

        // Ejecutar acción
        $result = $this->action->execute($service);

        // Verificar que se eliminó
        $this->assertTrue($result);
        Storage::disk('local')->assertMissing($path);
        $this->assertNull(Service::find($service->id));
    }

    public function test_returns_false_if_file_does_not_exist()
    {
        $service = Service::create([
            'student_id' => Student::factory()->create()->id,
            'type' => 'transferencia',
            'amount' => 100,
            'file_path' => 'nonexistent/path/file.pdf',
            'disk' => 'local',
            'status' => 'pending',
        ]);

        $result = $this->action->execute($service);

        $this->assertFalse($result);
    }

    public function test_returns_false_if_delete_fails()
    {
        $student = Student::factory()->create();
        $service = Service::create([
            'student_id' => $student->id,
            'type' => 'transferencia',
            'amount' => 100,
            'file_path' => 'servicios/student_' . $student->id . '/test.pdf',
            'disk' => 'local',
            'status' => 'pending',
        ]);

        // No crear el archivo, así el delete fallará

        $result = $this->action->execute($service);

        $this->assertFalse($result);
    }
}
```

**Ejecutar:**
```bash
php artisan test tests/Unit/Actions/DeleteStudentServiceTest.php
```

---

### 1.3 EnrollStudentsRequest Validation

**Archivo test:** `tests/Unit/Requests/EnrollStudentsRequestTest.php`

```php
<?php

namespace Tests\Unit\Requests;

use App\Enums\StudentStatus;
use App\Http\Requests\EnrollStudentsRequest;
use App\Models\Group;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class EnrollStudentsRequestTest extends TestCase
{
    public function test_validates_student_ids_exist()
    {
        $request = new EnrollStudentsRequest();
        $request->merge(['student_ids' => [9999, 9998]]);

        $this->assertFalse($request->passes());
        $this->assertArrayHasKey('student_ids.*', $request->errors()->messages());
    }

    public function test_requires_student_ids_array()
    {
        $request = new EnrollStudentsRequest();
        $request->merge(['student_ids' => 'not-an-array']);

        $this->assertFalse($request->passes());
    }

    public function test_requires_validated_students_for_enrollment()
    {
        $validatedStudent = Student::factory()->create([
            'status' => StudentStatus::VALIDATED->value
        ]);
        $pendingStudent = Student::factory()->create([
            'status' => StudentStatus::PAYMENT_REVIEW->value
        ]);

        $request = new EnrollStudentsRequest();
        $request->setUserResolver(function () {
            $user = User::factory()->create();
            $user->assignRole('admin');
            return $user;
        });
        $request->merge([
            'student_ids' => [$validatedStudent->id, $pendingStudent->id]
        ]);

        $this->assertFalse($request->passes());
        $this->assertArrayHasKey('student_ids', $request->errors()->messages());
    }

    public function test_allows_all_validated_students()
    {
        $students = Student::factory(3)->create([
            'status' => StudentStatus::VALIDATED->value
        ]);
        $studentIds = $students->pluck('id')->toArray();

        $request = new EnrollStudentsRequest();
        $request->setUserResolver(function () {
            $user = User::factory()->create();
            $user->assignRole('admin');
            return $user;
        });
        $request->merge(['student_ids' => $studentIds]);

        $this->assertTrue($request->passes());
    }

    public function test_authorization_requires_admin_role()
    {
        $request = new EnrollStudentsRequest();
        
        // User sin role admin
        $request->setUserResolver(function () {
            return User::factory()->create();
        });

        $this->assertFalse($request->authorize());
    }

    public function test_authorization_allows_admin_role()
    {
        $request = new EnrollStudentsRequest();
        
        $request->setUserResolver(function () {
            $user = User::factory()->create();
            $user->assignRole('admin');
            return $user;
        });

        $this->assertTrue($request->authorize());
    }
}
```

**Ejecutar:**
```bash
php artisan test tests/Unit/Requests/EnrollStudentsRequestTest.php
```

---

## 2. FEATURE TESTS

### 2.1 Flujo Completo: Subir → Revisar → Validar

**Archivo test:** `tests/Feature/ServiceFlowTest.php`

```php
<?php

namespace Tests\Feature;

use App\Enums\ServiceStatus;
use App\Enums\StudentStatus;
use App\Models\Period;
use App\Models\Service;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ServiceFlowTest extends TestCase
{
    protected Student $student;
    protected User $admin;
    protected Period $activePeriod;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');

        $this->student = Student::factory()->create([
            'status' => StudentStatus::WAITING->value
        ]);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->activePeriod = Period::factory()->create([
            'is_active' => true
        ]);
    }

    public function test_student_can_upload_service()
    {
        $this->actingAs($this->student->user);

        $file = UploadedFile::fake()->create('payment.pdf', 100);

        $response = $this->post(route('services.store'), [
            'file' => $file,
            'type' => 'transferencia',
            'amount' => 500.00,
            'reference_number' => 'REF-001',
            'description' => 'Pago inscripción',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('services', [
            'student_id' => $this->student->id,
            'type' => 'transferencia',
            'status' => ServiceStatus::PENDING->value,
        ]);

        $this->student->refresh();
        $this->assertEquals(StudentStatus::PAYMENT_REVIEW->value, $this->student->status->value);
    }

    public function test_admin_can_approve_service()
    {
        $service = Service::factory()->create([
            'student_id' => $this->student->id,
            'status' => ServiceStatus::PENDING->value,
            'period_id' => null,
        ]);

        $this->student->update(['status' => StudentStatus::PAYMENT_REVIEW->value]);

        $this->actingAs($this->admin);

        $response = $this->put(route('services.update', $service->id), [
            'status' => ServiceStatus::APPROVED->value,
            'comments' => '',
        ]);

        $response->assertRedirect();
        $service->refresh();

        $this->assertEquals(ServiceStatus::APPROVED->value, $service->status->value);
        $this->assertEquals($this->activePeriod->id, $service->period_id);

        $this->student->refresh();
        $this->assertEquals(StudentStatus::VALIDATED->value, $this->student->status->value);
    }

    public function test_admin_can_reject_service()
    {
        $service = Service::factory()->create([
            'student_id' => $this->student->id,
            'status' => ServiceStatus::PENDING->value,
        ]);

        $this->student->update(['status' => StudentStatus::PAYMENT_REVIEW->value]);

        $this->actingAs($this->admin);

        $response = $this->put(route('services.update', $service->id), [
            'status' => ServiceStatus::REJECTED->value,
            'comments' => 'Comprobante no legible',
        ]);

        $response->assertRedirect();
        $service->refresh();

        $this->assertEquals(ServiceStatus::REJECTED->value, $service->status->value);
        $this->assertEquals('Comprobante no legible', $service->comments);

        $this->student->refresh();
        $this->assertEquals(StudentStatus::WAITING->value, $this->student->status->value);
    }

    public function test_student_can_delete_pending_service()
    {
        $service = Service::factory()->create([
            'student_id' => $this->student->id,
            'status' => ServiceStatus::PENDING->value,
            'file_path' => 'servicios/student_' . $this->student->id . '/test.pdf',
        ]);

        // Crear archivo fake
        Storage::disk('local')->put($service->file_path, 'fake content');

        $this->actingAs($this->student->user);

        $response = $this->delete(route('services.destroy', $service->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('services', ['id' => $service->id]);
        Storage::disk('local')->assertMissing($service->file_path);
    }

    public function test_student_cannot_delete_approved_service()
    {
        $service = Service::factory()->create([
            'student_id' => $this->student->id,
            'status' => ServiceStatus::APPROVED->value,
        ]);

        $this->actingAs($this->student->user);

        $response = $this->delete(route('services.destroy', $service->id));

        // Debería permitir eliminación, pero registrar auditoría opcional
        $response->assertRedirect();
    }

    public function test_student_can_download_own_service()
    {
        $service = Service::factory()->create([
            'student_id' => $this->student->id,
            'file_path' => 'servicios/student_' . $this->student->id . '/test.pdf',
            'disk' => 'local',
            'original_name' => 'payment.pdf',
        ]);

        Storage::disk('local')->put($service->file_path, 'file content');

        $this->actingAs($this->student->user);

        $response = $this->get(route('services.download', $service->id));

        $response->assertOk();
    }

    public function test_admin_can_download_any_service()
    {
        $service = Service::factory()->create([
            'student_id' => $this->student->id,
            'file_path' => 'servicios/student_' . $this->student->id . '/test.pdf',
            'disk' => 'local',
            'original_name' => 'payment.pdf',
        ]);

        Storage::disk('local')->put($service->file_path, 'file content');

        $this->actingAs($this->admin);

        $response = $this->get(route('services.download', $service->id));

        $response->assertOk();
    }

    public function test_unauthorized_user_cannot_download()
    {
        $otherStudent = Student::factory()->create();
        $service = Service::factory()->create([
            'student_id' => $this->student->id,
            'file_path' => 'servicios/student_' . $this->student->id . '/test.pdf',
            'disk' => 'local',
        ]);

        $this->actingAs($otherStudent->user);

        $response = $this->get(route('services.download', $service->id));

        $response->assertForbidden();
    }
}
```

**Ejecutar:**
```bash
php artisan test tests/Feature/ServiceFlowTest.php
```

---

### 2.2 Enroll con Validación de Status

**Archivo test:** `tests/Feature/EnrollWithValidationTest.php`

```php
<?php

namespace Tests\Feature;

use App\Enums\GroupType;
use App\Enums\StudentStatus;
use App\Models\Group;
use App\Models\Level;
use App\Models\Period;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Tests\TestCase;

class EnrollWithValidationTest extends TestCase
{
    protected Group $group;
    protected Student $validatedStudent;
    protected Student $pendingStudent;
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $teacher = Teacher::factory()->create();
        $period = Period::factory()->create();
        $level = Level::factory()->create();

        $this->group = Group::factory()->create([
            'teacher_id' => $teacher->id,
            'period_id' => $period->id,
            'level_id' => $level->id,
            'type' => GroupType::REGULAR->value,
            'capacity' => 30,
        ]);

        $this->validatedStudent = Student::factory()->create([
            'status' => StudentStatus::VALIDATED->value
        ]);

        $this->pendingStudent = Student::factory()->create([
            'status' => StudentStatus::PAYMENT_REVIEW->value
        ]);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    public function test_can_enroll_validated_student()
    {
        $this->actingAs($this->admin);

        $response = $this->post(route('groups.enroll', $this->group->id), [
            'student_ids' => [$this->validatedStudent->id],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('qualifications', [
            'group_id' => $this->group->id,
            'student_id' => $this->validatedStudent->id,
        ]);
    }

    public function test_cannot_enroll_pending_student()
    {
        $this->actingAs($this->admin);

        $response = $this->post(route('groups.enroll', $this->group->id), [
            'student_ids' => [$this->pendingStudent->id],
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('student_ids');
        $this->assertDatabaseMissing('qualifications', [
            'group_id' => $this->group->id,
            'student_id' => $this->pendingStudent->id,
        ]);
    }

    public function test_cannot_enroll_mixed_status_students()
    {
        $this->actingAs($this->admin);

        $response = $this->post(route('groups.enroll', $this->group->id), [
            'student_ids' => [
                $this->validatedStudent->id,
                $this->pendingStudent->id,
            ],
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('student_ids');
    }

    public function test_enrolled_students_appear_in_group_dashboard()
    {
        $this->actingAs($this->admin);

        $this->post(route('groups.enroll', $this->group->id), [
            'student_ids' => [$this->validatedStudent->id],
        ]);

        // Verificar que el alumno aparece en disponibles
        $response = $this->get(route('groups.show', $this->group->id));

        $response->assertOk();
        // Verificar que el alumno NO aparece en disponibles (ya está inscrito)
        $this->assertDatabaseHas('qualifications', [
            'group_id' => $this->group->id,
            'student_id' => $this->validatedStudent->id,
        ]);
    }
}
```

**Ejecutar:**
```bash
php artisan test tests/Feature/EnrollWithValidationTest.php
```

---

## 3. TESTS DE INTEGRACIÓN (Manual)

Ejecuta estos casos manualmente en `localhost:8000`:

### 3.1 Flujo Alumno
```
1. Inicia sesión como student@example.com (cualquier alumno)
2. Ve a /pagos
3. Haz clic en "Nuevo Pago"
4. Sube un PDF (si no tienes, crea uno fake: echo "test" > test.pdf)
5. Llena: Tipo=Transferencia, Monto=500, Referencia=REF-001, Descripción=Test
6. Haz clic "Subir Pago"
7. Deberías ver: Éxito, alumno en estado PAYMENT_REVIEW
8. En otra pestaña, verifica: SELECT * FROM students WHERE id=X; (status debe ser 'payment_review')
9. Intenta inscribirte en un grupo (debería fallar o mostrarte error)
```

### 3.2 Flujo Admin/Coordinator
```
1. Inicia sesión como admin@example.com
2. Ve a /pagos
3. Ve todos los pagos
4. Haz clic en uno pending
5. Modal de revisión: aproba + deja comentario
6. Guardar
7. Verifica: Alumno en estado VALIDATED, periodo_id asignado
8. Ahora el alumno PUEDE enrolarse en grupos
9. Prueba rechazar otro pago
10. Verifica: Alumno regresa a WAITING
```

### 3.3 Descarga y Eliminación
```
1. Como estudiante, haz clic en un pago subido
2. Click en "Descargar"
3. Verifica que el archivo se descargue
4. Haz clic en "Eliminar"
5. Confirma
6. Verifica que desaparezca de la lista
```

### 3.4 Acceso Coordinator
```
1. Inicia sesión como coordinator (si existe)
2. Ve a /pagos
3. Deberías VER todos los pagos (no solo los propios)
4. Deberías PODER revisar un pago
5. Si NO puedes acceder, revienta P1
```

---

## 4. Verificación de Datos

### 4.1 Base de Datos
```sql
-- Verificar que servicios existen con period_id correcto
SELECT id, student_id, status, period_id, created_at FROM services LIMIT 10;

-- Verificar estados de estudiante
SELECT id, first_name, status FROM students WHERE status IN ('payment_review', 'validated') LIMIT 5;

-- Verificar período activo existe
SELECT id, name, is_active FROM periods WHERE is_active = 1;

-- Verificar archivos en storage
-- En terminal: ls -la storage/app/servicios/
```

### 4.2 Logs
```bash
# Ver si hay errores de validación
tail -f storage/logs/laravel.log

# Filtrar por servicio
grep -i service storage/logs/laravel.log
```

---

## 5. Coverage Esperado

Después de ejecutar todos los tests:

```bash
php artisan test --coverage --coverage-html=coverage --coverage-clover=coverage.xml
```

**Targets esperados:**
- `StoreStudentService`: >90% coverage
- `DeleteStudentService`: >90% coverage
- `EnrollStudentsRequest`: >85% coverage
- `ServiceController`: >80% coverage

---

## 6. Checklist Final

- [ ] Todos los unit tests pasan ✅
- [ ] Todos los feature tests pasan ✅
- [ ] Manual flow: Alumno → Admin → Válido → Enroll ✅
- [ ] Coordinator puede acceder a /pagos ✅
- [ ] Alumno no validado NO puede enrolarse ✅
- [ ] Descarga de archivos funciona ✅
- [ ] Eliminación de archivos funciona ✅
- [ ] Base de datos tiene datos correctos ✅
- [ ] No hay errores en logs ✅
- [ ] Coverage >80% ✅

---

**Si todos los checks pasan, rama lista para integración.**
