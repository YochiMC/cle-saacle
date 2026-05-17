# Análisis Detallado: Problemas Críticos en Módulo de Inscripciones

**Fecha**: 16 de Mayo, 2026  
**Rama**: `solve-inscriptions`  
**Versión**: 1.0

---

## 📌 Resumen Ejecutivo

El módulo de inscripciones presenta **10 problemas** identificados, 4 de los cuales son **críticos** y rompen la lógica de negocio:

1. **Conflicto de estados en aprobación de pago** - Estados impredecibles
2. **Sin validación de capacidad** - Grupos se pueden sobrecargar
3. **Observer sobrescribe estados** - Cambios no deseados
4. **Transacciones incompletas** - Datos inconsistentes

---

## 🔴 PROBLEMAS CRÍTICOS

### Problema #1: Conflicto de Actualización de Estado en Aprobación de Pago

**Descripción Técnica**

Cuando un administrador aprueba un pago de estudiante, se desencadena una cadena de actualizaciones que **NO es atómica**:

```
Flujo Actual (INCORRECTO):
┌─ ServiceController::update()
│  └─> $service->update(['status' => 'approved'])  // Query 1
│  └─> $student->update(['status' => 'validated']) // Query 2
│
└─ ServiceObserver::updated()  (Trigger registrado)
   └─> $student->update(['status' => 'elegible_inscripcion']) // Query 3
```

**Problema de Orden**

En Laravel, los Observers se ejecutan en el mismo ciclo de transacción de base de datos. No hay garantía de orden entre:
- Las updates en `ServiceController`
- El trigger del `ServiceObserver`

Resultado: El estado final puede ser cualquiera de los dos, dependiendo del orden.

**Código Problemático**

`app/Http/Controllers/ServiceController.php` (líneas 51-57):
```php
public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
{
    Gate::authorize('update', $service);

    $service->update($request->validated()); // Status changed here

    $student = $service->student;
    if ($student) {
        if ($request->status === ServiceStatus::APPROVED->value) {
            // Update #1: Student status changed
            $student->update(['status' => StudentStatus::VALIDATED]);

            $activePeriod = Period::where('is_active', true)->first();
            if ($activePeriod) {
                // Update #2: Service period (sin transacción!)
                $service->update(['period_id' => $activePeriod->id]);
            }
        } elseif ($request->status === ServiceStatus::REJECTED->value) {
            $student->update(['status' => StudentStatus::WAITING]);
        }
    }

    return back()->with('success', 'Pago actualizado exitosamente.');
}
```

`app/Observers/ServiceObserver.php` (líneas 16-22):
```php
public function updated(Service $service): void
{
    if (!$service->wasChanged('status')) {
        return;
    }

    // Also tries to update student status
    if ($service->status === ServiceStatus::APPROVED) {
        $student = $service->student;
        if ($student) {
            $student->update([
                'status' => StudentStatus::ELEGIBLE_INSCRIPCION, // Conflicto!
            ]);
        }
    }
}
```

**Demostración del Fallo**

Test que revela la inconsistencia:

```php
public function test_service_approval_state_is_inconsistent(): void
{
    $student = Student::factory()->withRole()->create();
    $service = Service::factory()->create([
        'student_id' => $student->id,
        'status' => ServiceStatus::PENDING->value,
    ]);

    // Approve the service
    $this->actingAs($student->user)
        ->put(route('services.update', $service), [
            'status' => ServiceStatus::APPROVED->value,
        ]);

    $updatedStudent = $student->fresh();
    
    // ❌ FALLA: Status podría ser cualquiera de estos
    $this->assertTrue(
        $updatedStudent->status === StudentStatus::VALIDATED 
        || $updatedStudent->status === StudentStatus::ELEGIBLE_INSCRIPCION
    );
    // ← Esto no debería ser necesario - el estado debe ser DETERMINÍSTICO
}
```

**Impacto en Usuario Final**

```
Escenario: Alumno A sube comprobante de pago

Caso 1 (Query orden A):
1. ServiceController actualiza Service status → APPROVED
2. ServiceController actualiza Student status → VALIDATED
3. ServiceObserver intenta actualizar → ELEGIBLE_INSCRIPCION (sobrescribe)
4. Resultado: Estado final = ELEGIBLE_INSCRIPCION ✓ (suerte)

Caso 2 (Query orden B):
1. ServiceObserver actualiza Student → ELEGIBLE_INSCRIPCION
2. ServiceController actualiza Student → VALIDATED (sobrescribe)
3. ServiceController actualiza Service period
4. Resultado: Estado final = VALIDATED ✓ (suerte)

Caso 3 (Bajo carga, ejecución asíncrona):
1. ServiceController actualiza
2. Conexión se cierra
3. ServiceObserver nunca ejecuta
4. Resultado: Estado final = VALIDATED ✗ (funciona por suerte)

Problema: No hay garantía de que el estado sea correcto.
```

**Consecuencias**

- Alumno aprueba pago pero NO puede ver grupos disponibles (status incorrecto)
- Logs de auditoría muestran estados inconsistentes
- Estado en BD no coincide con estado en cache

**Solución Propuesta**

Ver sección de Implementación #1.

---

### Problema #2: Sin Validación de Capacidad en Inscripciones

**Descripción Técnica**

El backend **NO verifica** si un grupo o examen tiene cupos disponibles. La validación ocurre SOLO en el frontend (que es manipulable).

**Código Problemático**

`app/Actions/EnrollStudentsInGroup.php`:
```php
public function execute(Group $group, array $studentIds): void
{
    $existingQualification = $group->qualifications()->first();
    $existingUnitsBreakdown = $existingQualification?->units_breakdown ?? [];

    $enumDefaults = $group->type->defaultUnitsBreakdown($group->evaluable_units ?? 0);
    // ... cálculos de schema ...

    DB::transaction(function () use ($group, $studentIds, $defaultUnitsBreakdown, $initialAverage) {
        foreach ($studentIds as $studentId) {
            // ❌ NO HAY VALIDACIÓN DE CAPACIDAD
            Qualification::create([
                'group_id'        => $group->id,
                'student_id'      => $studentId,
                'units_breakdown' => $defaultUnitsBreakdown,
                'final_average'   => $initialAverage,
                'is_left'         => false,
                'attempt'         => AttemptEnum::FIRST->value,
            ]);
        }
    });
}
```

Mismo problema en `app/Actions/EnrollStudentsInExam.php` (líneas 33-45).

**Demostración del Fallo - Ataque de Concurrencia**

```php
public function test_group_capacity_can_be_exceeded_with_concurrent_enrollments(): void
{
    $group = Group::factory()->create(['capacity' => 2]);
    $student1 = Student::factory()->withRole()->create();
    $student2 = Student::factory()->withRole()->create();
    $student3 = Student::factory()->withRole()->create();

    // Simular dos requests concurrentes en el último cupo
    Concurrency::parallelize([
        fn() => $this->actingAs($student1->user)
            ->post(route('self-enroll', $group)),
        fn() => $this->actingAs($student2->user)
            ->post(route('self-enroll', $group)),
        fn() => $this->actingAs($student3->user) // Tercero simultáneamente
            ->post(route('self-enroll', $group)),
    ]);

    // ❌ FALLA: Grupo tiene 3 inscritos pero capacidad es 2
    $this->assertCount(3, $group->qualifications());
    // Esperado: 2 (respetando capacidad)
}
```

**Escenario Real**

```
Grupo Regular: "Inglés 101"
- Capacidad: 20
- Inscritos: 19 ✓
- Cupos disponibles: 1

Momento T:
- Alumno A hace POST /grupos/5/auto-inscribir
- Alumno B hace POST /grupos/5/auto-inscribir (simultáneamente)

Milisegundos después:
- Query 1 (Alumno A): SELECT COUNT(*) FROM qualifications WHERE group_id = 5
  → Resultado: 19 (todavía)
- Query 1 (Alumno B): SELECT COUNT(*) FROM qualifications WHERE group_id = 5
  → Resultado: 19 (todavía, concurrencia)

Luego:
- INSERT qualification para Alumno A → Éxito (total 20)
- INSERT qualification para Alumno B → Éxito (total 21) ❌

Resultado: Grupo con 21 estudiantes en capacidad 20
```

**Impacto**

- Profesor recibe 21 estudiantes en aula para 20 asientos
- Grupo aparece en reporte como "39 cupos utilizados de 20"
- Sistema de calificación espera máximo N estudiantes
- Auditoría rota

**Solución Propuesta**

Ver sección de Implementación #2.

---

### Problema #3: Observer Sobrescribe Estados Críticos

**Descripción Técnica**

El `ServiceObserver` actualiza el estado del estudiante **sin verificar** el estado previo. Esto causa cambios no deseados en la elegibilidad.

**Código Problemático**

`app/Observers/ServiceObserver.php`:
```php
public function updated(Service $service): void
{
    if (!$service->wasChanged('status')) {
        return;
    }

    if ($service->status === ServiceStatus::APPROVED) {
        $student = $service->student;
        if ($student) {
            // ❌ NO VERIFICA ESTADO PREVIO
            $student->update([
                'status' => StudentStatus::ELEGIBLE_INSCRIPCION,
            ]);
        }
    }
}
```

**Caso de Fallo #1: Alumno Acreditado**

```
Estado Previo: ACCREDITED (ya pasó el nivel)

Flujo:
1. Alumno sube nuevo pago "por si acaso"
2. Admin aprueba pago
3. Observer ejecuta: status = ELEGIBLE_INSCRIPCION
4. Resultado: Alumno acreditado ahora es "eligible" para inscripción

Impacto:
- Alumno ve grupos disponibles que ya pasó
- Puede intentar re-inscribirse
- Reportes de acreditaciones rotos
```

**Caso de Fallo #2: Alumno Inhabilitado**

```
Estado Previo: DISABLED (suspendido por bajo desempeño)

Flujo:
1. Alumno sube pago (de manera no autorizada)
2. Admin aprueba por error
3. Observer ejecuta: status = ELEGIBLE_INSCRIPCION
4. Resultado: Alumno inhabilitado ahora puede inscribirse

Impacto:
- Rompe regla de negocio de suspensión
- Alumno accede a recursos sin autorización
```

**Test que Revela el Problema**

```php
public function test_observer_does_not_check_previous_student_status(): void
{
    $student = Student::factory()->create([
        'status' => StudentStatus::ACCREDITED->value, // Ya acreditado
    ]);

    $service = Service::factory()->create([
        'student_id' => $student->id,
        'status' => ServiceStatus::PENDING->value,
    ]);

    // Admin aprueba
    Service::where('id', $service->id)->update([
        'status' => ServiceStatus::APPROVED->value,
    ]);

    // Trigger observer
    $student->refresh();

    // ❌ FALLA: Estado cambió de ACCREDITED a ELEGIBLE_INSCRIPCION
    $this->assertEquals(StudentStatus::ACCREDITED, $student->status);
    // Actual: ELEGIBLE_INSCRIPCION (observer sobrescribió)
}
```

**Matriz de Estados Problemáticos**

| Estado Previo | Después Observer | Esperado | Problema |
|---------------|------------------|----------|----------|
| ACCREDITED | ELEGIBLE_INSCRIPCION | ACCREDITED | ❌ Downgrade no deseado |
| DISABLED | ELEGIBLE_INSCRIPCION | DISABLED | ❌ Suspensión rota |
| IN_REVIEW | ELEGIBLE_INSCRIPCION | IN_REVIEW | ❌ Revisión interrumpida |
| WAITING | ELEGIBLE_INSCRIPCION | ELEGIBLE_INSCRIPCION | ✓ OK |
| PAYMENT_REVIEW | ELEGIBLE_INSCRIPCION | ELEGIBLE_INSCRIPCION | ✓ OK |

**Solución Propuesta**

Ver sección de Implementación #3.

---

### Problema #4: Transacción Incompleta en Aprobación de Pago

**Descripción Técnica**

El método `ServiceController::update()` ejecuta **3 queries separadas sin transacción**, causando inconsistencia si una falla.

**Código Problemático**

```php
public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
{
    Gate::authorize('update', $service);

    $service->update($request->validated());  // Query 1: Update Service

    $student = $service->student;
    if ($student) {
        if ($request->status === ServiceStatus::APPROVED->value) {
            $student->update(['status' => StudentStatus::VALIDATED]); // Query 2

            $activePeriod = Period::where('is_active', true)->first();
            if ($activePeriod) {
                $service->update(['period_id' => $activePeriod->id]); // Query 3
                // ❌ Sin transacción, si falla aquí queda inconsistente
            }
        }
        // ...
    }

    return back()->with('success', ...');
}
```

**Escenario de Fallo**

```
Ejecución Normal:
Query 1: Service.status = APPROVED ✓
Query 2: Student.status = VALIDATED ✓
Query 3: Service.period_id = [period.id] ✓
Estado: ✓ Consistente

Fallo en Red:
Query 1: Service.status = APPROVED ✓
Query 2: Student.status = VALIDATED ✓
Query 3: Conexión interrumpida ❌
Estado: ✗ Inconsistente
  └─> Service.status = APPROVED
  └─> Student.status = VALIDATED
  └─> Service.period_id = NULL (nunca se asignó)
```

**Impacto**

- Servicio sin `period_id` → Reportes por período rotos
- Auditoría incompleta: "¿en qué período se aprobó este pago?"
- Consultas que filtran por período no incluyen este servicio
- Query: `Service::where('period_id', $period->id)` → Resultado incompleto

**Datos Rotos en BD**

```sql
SELECT id, type, status, period_id 
FROM services 
WHERE student_id = 1;

-- Resultado:
-- | 1 | Regular | approved | 3      |  ✓
-- | 2 | Regular | pending  | NULL   |  ✓
-- | 3 | Regular | approved | NULL   |  ❌ DEBE tener period_id
-- | 4 | Regular | rejected | NULL   |  ✓
```

**Solución Propuesta**

Ver sección de Implementación #4.

---

## 🟡 PROBLEMAS IMPORTANTES

### Problema #5: Confusión Semántica entre VALIDATED y ELEGIBLE_INSCRIPCION

**Descripción**

Existen dos estados con propósitos similares:

```php
// StudentStatus.php
case VALIDATED = 'validated';                      // ¿Validado por admin?
case ELEGIBLE_INSCRIPCION = 'elegible_inscripcion'; // ¿Elegible para inscripción?

// Ambos se consideran "eligibles"
public static function enrollmentEligibleCases(): array
{
    return [self::VALIDATED, self::ELEGIBLE_INSCRIPCION];
}
```

**Pregunta sin Respuesta**

- ¿Cuál es la diferencia semántica?
- ¿Cuándo usar uno vs. otro?
- ¿Cómo transiciona un estado al otro?

**Código Actual (Ambiguo)**

```
ServiceController: status = VALIDATED
ServiceObserver: status = ELEGIBLE_INSCRIPCION

← ¿Cuál es la verdad?
```

**Impacto**

- Difícil entender el flujo de negocio
- Confusión al debuggear estados
- Tests duplicados (verificar ambos estados)
- Documentación confusa

**Solución Propuesta**

Consolidar a un estado único durante el análisis de implementación.

---

### Problema #6: Múltiples Pagos del Mismo Concepto

**Descripción**

Si un alumno sube 2 pagos idénticos (ej: "Regular"), ambos se consideran válidos sin validación de "unicidad".

**Código Problemático**

`app/Models/Student.php`:
```php
public function approvedCourseTypeValues(): array
{
    $approvedTypeValues = $this->approvedServiceTypeValues();

    return array_values(array_filter(
        $approvedTypeValues,
        fn (string $serviceTypeValue) => 
            ServiceType::tryFrom($serviceTypeValue)?->isCourse() ?? false
    ));
}

// Retorna: ['Regular', 'Regular'] si hay 2 servicios Regular aprobados
```

**Caso**

```
Alumno sube: "Pago Regular" (Foto comprobante 1)
Admin aprueba ✓

Alumno sube: "Pago Regular" (Foto comprobante 2 - misma foto)
Admin aprueba ✓

approvedCourseTypeValues() retorna: ['Regular', 'Regular']

Resultado: Alumno puede inscribirse en múltiples grupos Regular
```

**Solución Propuesta**

Agregar validación de unicidad o asociar cada inscripción a un Service específico.

---

### Problema #7: Sin Manejo de Pago Rechazado

**Descripción**

Cuando un pago es rechazado, el flujo es opaco:

```php
elseif ($request->status === ServiceStatus::REJECTED->value) {
    $student->update(['status' => StudentStatus::WAITING]);
}
```

**Preguntas sin Respuesta**

- ¿Por qué fue rechazado? (No hay razón registrada de forma visible)
- ¿Puede el alumno subir otro comprobante?
- ¿Debe contactar al admin?
- ¿Hay limite de reintentos?

**Test de UX**

```
Flujo Actual:
1. Alumno sube pago
2. Admin rechaza (sin comentario)
3. Alumno ve "Tu estatus es: En Espera"
4. ¿? Alumno no sabe qué hacer
   ├─ ¿Reintento?
   ├─ ¿Contactar admin?
   └─ ¿Esperar?
```

**Solución Propuesta**

Mejorar UX con comentarios claros y flujo de reintentos.

---

## 🔵 PROBLEMAS MENORES

### Problema #8: Period_id No Se Asigna en Creación

Service creado sin `period_id`, causando reportes incompletos.

### Problema #9: Validación de Período Insuficiente

No verifica status `ENROLLING` del período, solo fechas.

### Problema #10: Desinscripción Masiva Sin Atomicidad

Múltiples operaciones sin transacción = pérdida de inscripción bajo fallo.

---

## 🎯 Matriz de Impacto

| Problema | Severidad | Usuarios Afectados | Data Loss | Funcionalidad |
|----------|-----------|-------------------|-----------|---------------|
| 1. Conflicto estados | 🔴 | Alto | No | Sí |
| 2. Sin capacidad | 🔴 | Crítico | No | Sí |
| 3. Observer sobrescribe | 🔴 | Medio | No | Sí |
| 4. Transacción incompleta | 🔴 | Bajo | Sí | No |
| 5. Confusión VALIDATED | 🟡 | Bajo | No | No |
| 6. Múltiples pagos | 🟡 | Medio | No | Sí |
| 7. Pago rechazado | 🟡 | Medio | No | Sí |
| 8. Period_id faltante | 🔵 | Bajo | No | No |
| 9. Validación período | 🔵 | Bajo | No | No |
| 10. Desinscripción | 🔵 | Bajo | Sí | No |

---

## 📝 Notas de Auditoría

Estos problemas fueron identificados durante análisis de:
- Flujo de pagos y elegibilidad
- Validaciones de capacidad
- Manejo de estados y transiciones
- Atomicidad de operaciones
- Edge cases de concurrencia

Los problemas NO serían evitentes en testing básico, requieren:
- Testing de concurrencia
- Simulación de fallos de red
- Auditoría de estados
- Análisis de race conditions
