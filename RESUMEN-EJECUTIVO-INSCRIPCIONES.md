# Resumen Ejecutivo: Problemas Críticos en Módulo de Inscripciones

**Fecha**: 16 de Mayo, 2026  
**Severidad**: 🔴 CRÍTICA (4 problemas) + 🟡 IMPORTANTE (3) + 🔵 MENOR (3)

---

## 🎯 Hallazgos Principales

### 1️⃣ Conflicto de Actualización de Estado (**CRÍTICO**)
- **Síntoma**: Después de aprobar pago, estudiante puede o no ver grupos disponibles
- **Causa**: Controller y Observer actualizan estado independientemente (no atómico)
- **Riesgo**: Estado impredecible en BD
- **Solución**: Transacción atómica en ServiceController + eliminar Observer
- **Estimación**: 3h

### 2️⃣ Sin Validación de Capacidad (**CRÍTICO**)
- **Síntoma**: Grupo con capacidad 20 termina con 22 estudiantes
- **Causa**: Backend no valida límite de cupos, frontend es manipulable
- **Riesgo**: Violación de contrato de capacidad
- **Solución**: Lock BD (`SELECT FOR UPDATE`) en acciones de inscripción
- **Estimación**: 2h

### 3️⃣ Observer Sobrescribe Estados (**CRÍTICO**)
- **Síntoma**: Alumno acreditado vuelve a "elegible" tras aprobar pago
- **Causa**: Observer no verifica estado previo antes de actualizar
- **Riesgo**: Cambios no deseados de elegibilidad
- **Solución**: Agregar guarda en ServiceController: `canTransitionToEligible()`
- **Estimación**: 1h (incluido en #1)

### 4️⃣ Transacción Incompleta (**CRÍTICO**)
- **Síntoma**: Service sin period_id si conexión falla a mitad
- **Causa**: 3 queries separadas sin `DB::transaction()`
- **Riesgo**: Datos inconsistentes, reportes rotos
- **Solución**: Envolver todas las updates en transacción
- **Estimación**: 1h (incluido en #1)

### 5️⃣ Confusión VALIDATED vs ELEGIBLE_INSCRIPCION (**IMPORTANTE**)
- **Síntoma**: Dos estados diferentes para lo mismo
- **Causa**: Diseño ambiguo sin documentación clara
- **Solución**: Eliminar VALIDATED, usar solo ELEGIBLE_INSCRIPCION
- **Estimación**: 1h

---

## 📊 Matriz de Impacto

```
Usuario Final          Sistema
├─ Muy Afectado       ├─ Data Loss: Sí
│  │                  └─ Transacción: Rota
│  Problemas: #1,#2   
│  Síntomas:          
│  - No ve grupos     
│  - Grupos llenos    
│  - Estados confusos
│
├─ Afectado
│  Problema: #3,#4
│  Síntomas:
│  - Cambios no esperados
│  - Reportes inconsistentes
│
└─ Poco Afectado
   Problema: #5-#10
```

---

## 🚀 Plan de Acción Rápido

### Semana 1 (Críticos - 7h total)

```
Lunes:    Impl #1 - Resolver conflicto (3h)
          └─ Refactorizar ServiceController + tests

Martes:   Impl #2 - Validar capacidad (2h)
          └─ Agregar locks en EnrollStudentsInGroup/Exam

Miércoles: Impl #3-4 - Proteger estados (2h)
          └─ Crear guardia + tests

Jueves:   Testing integral (4h)
          └─ Pasar todos los tests + QA manual

Viernes:  Documentación + PR (2h)
          └─ Actualizar docs + merge a dev-fix
```

### Semana 2 (Importante/Menores - 5h)

```
- Impl #5-10: Problemas menores (5h)
- Deploy a staging y validación
```

---

## 📁 Documentos de Referencia

### Análisis Técnico Completo
📄 **docs/ANALISIS-PROBLEMAS-INSCRIPCIONES.md**
- Descripción técnica de cada problema
- Código problemático actual
- Tests que demuestran fallo
- Impacto en usuario final

### Plan de Implementación Detallado
📄 **docs/PLAN-TRABAJO-INSCRIPCIONES.md**
- Soluciones propuestas con código
- Tests para validar soluciones
- Checklist de implementación
- Estimación de tiempo
- Riesgos y mitigación

---

## 🔧 Implementación Inmediata

### Paso 1: Crear Rama
```bash
git checkout -b solve-inscriptions
```

### Paso 2: Implementar Problema #1 (Conflicto Estados)
Ver `PLAN-TRABAJO-INSCRIPCIONES.md` → Implementación #1

**Cambios**:
- [ ] `app/Http/Controllers/ServiceController.php` - Agregar transacción
- [ ] `app/Observers/ServiceObserver.php` - Desactivar
- [ ] `app/Enums/StudentStatus.php` - Eliminar VALIDATED
- [ ] `database/migrations/...` - Migrar VALIDATED → ELEGIBLE
- [ ] Tests nuevos - `tests/Feature/ServiceApprovalAtomicityTest.php`

### Paso 3: Implementar Problema #2 (Capacidad)
Ver `PLAN-TRABAJO-INSCRIPCIONES.md` → Implementación #2

**Cambios**:
- [ ] `app/Actions/EnrollStudentsInGroup.php` - Agregar lock + validación
- [ ] `app/Actions/EnrollStudentsInExam.php` - Igual
- [ ] `app/Exceptions/GroupCapacityExceededException.php` - Nueva
- [ ] Tests nuevos - `tests/Feature/EnrollmentCapacityTest.php`

### Paso 6: Flujo de Rechazo Transparente (Fase 4)

**Cambios**:
- [ ] `database/migrations/...` - Añadir columna `rejection_reason` a `services`
- [ ] `app/Models/Service.php` - Añadir `rejection_reason` a `fillable`
- [ ] `app/Http/Requests/StoreServiceRequest.php` - Permitir `service_id` para reintentos y validar pertenencia/estatus
- [ ] `app/Actions/StoreStudentService.php` - Soportar reintento sobre servicio rechazado: reemplaza archivo, limpia `rejection_reason`, deja `period_id` intacto
- [ ] `docs/...` - Actualizar instrucciones y notas de auditoría

**Comportamiento esperado**:
- Cuando un admin rechaza un comprobante, puede registrar una razón en `rejection_reason`.
- El alumno verá el motivo y podrá reintentar subiendo un nuevo archivo sobre el mismo registro (manteniendo `period_id`).


### Paso 4: Tests
```bash
php artisan test --filter="ServiceApproval|EnrollmentCapacity|StudentStatusProtection"
```

### Paso 5: Commit y Push
```bash
git add .
git commit -m "fix: solve critical issues in enrollment module (#1-4)"
git push origin solve-inscriptions
```

---

## ⚠️ Advertencias Importantes

- **⚠️ BREAKING CHANGE**: Eliminar estado `VALIDATED` requiere migration
- **⚠️ BD LOCK**: Usar `SELECT FOR UPDATE` puede causar espera. Monitorear en producción.
- **⚠️ PERÍODO ACTIVO**: Asegurarse de que existe al aprobar pago

---

## ✅ Validación

Después de implementar, verificar:

```php
// Test 1: Transacción atómica
$service->status === APPROVED ✓
$student->status === ELEGIBLE_INSCRIPCION ✓
$service->period_id === [period.id] ✓

// Test 2: Capacidad respetada
Group::capacity = 20
Group.qualifications.count() <= 20 ✓

// Test 3: Estados protegidos
if ($student->status === ACCREDITED)
  after_approval: status === ACCREDITED ✓

// Test 4: Concurrencia
2 alumnos POST simultáneamente al último cupo
→ Solo 1 se inscribe ✓
```

---

## 📞 Contacto para Dudas

Si durante la implementación surgen dudas sobre:
- Lógica de transacciones → Ver PLAN-TRABAJO #1
- Locks de BD → Ver PLAN-TRABAJO #2
- Estados complejos → Ver ANALISIS-PROBLEMAS #3-#5
- Tests → Ver tests incluidos en PLAN-TRABAJO

---

**Status**: Listo para iniciar implementación  
**Ramas**: solve-inscriptions (nueva)  
**Merge destino**: dev-fix
