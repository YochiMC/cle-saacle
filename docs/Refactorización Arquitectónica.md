# Walkthrough: Refactorización Arquitectónica — Fases 1 a 5

---

## FASE 1 — Reestructuración de `Pages/` por Dominios ✅

### Directorios creados / eliminados

| Antes | Después |
|---|---|
| `Pages/Test_MK2/` | `Pages/Groups/` |
| `Pages/Test_Vik/` | `Pages/Exams/` |
| `Pages/TestYochi/Users/` | `Pages/Users/` |
| `Pages/TestYochi/RolesPermissions/` | `Pages/Roles/` |
| `Pages/Test.jsx` (suelto) | `Pages/RecursosYochi/Test.jsx` |
| `Pages/Yochi.jsx` (suelto) | `Pages/RecursosYochi/Yochi.jsx` |

### Controllers actualizados (9 renders de Inertia)

| Controller | Antes | Después |
|---|---|---|
| `AdminViewsController.php` (5) | `TestYochi/...`, `Test_MK2/...`, `Test_Vik/...` | `Users/Users`, `Groups/Groups`, etc. |
| `GroupController.php` | `Test_MK2/GroupView` | `Groups/GroupView` |
| `ExamController.php` | `Test_Vik/ExamView` | `Exams/ExamView` |
| `RoleController.php` | `TestYochi/RolesPermissions/Asignation` | `Roles/Asignation` |
| `DegreeController.php` | `Test` | `RecursosYochi/Test` |

### Auditoría Fase 1: LIMPIO ✅
```
Cero referencias a Test_MK2, Test_Vik o TestYochi en resources/js/** y app/**
```

---

## FASE 2 — Componentización SRP: Pages/ → Components/ ✅

### Componentes movidos (8 archivos)

| Origen `Pages/` | Destino `Components/` |
|---|---|
| `Exams/CardExam.jsx` | `Components/Exams/CardExam.jsx` |
| `Exams/ExamDetailsModal.jsx` | `Components/Exams/ExamDetailsModal.jsx` |
| `Exams/ExamFormModal.jsx` | `Components/Exams/ExamFormModal.jsx` |
| `Groups/FormModals/GroupModal.jsx` | `Components/Groups/GroupModal.jsx` |
| `Roles/FormModals/RoleModal.jsx` | `Components/Roles/RoleModal.jsx` |
| `Roles/FormModals/UpdateRoleModal.jsx` | `Components/Roles/UpdateRoleModal.jsx` |
| `Users/FormModals/StudentModal.jsx` | `Components/Users/StudentModal.jsx` |
| `Users/FormModals/TeacherModal.jsx` | `Components/Users/TeacherModal.jsx` |

> Los 8 archivos usan imports absolutos `@/Components/*` internamente — no requirieron edición interna.

### Carpetas eliminadas

- `Pages/Groups/FormModals/` ✅
- `Pages/Roles/FormModals/` ✅
- `Pages/Users/FormModals/` ✅

### Imports actualizados (8 líneas en 4 vistas)

| Vista | Imports cambiados |
|---|---|
| `Pages/Exams/Examen.jsx` | 3 imports → `@/Components/Exams/...` |
| `Pages/Groups/Groups.jsx` | 1 import → `@/Components/Groups/GroupModal` |
| `Pages/Roles/Asignation.jsx` | 2 imports → `@/Components/Roles/...` |
| `Pages/Users/Users.jsx` | 2 imports → `@/Components/Users/...` |

### Código muerto eliminado (11 instancias)

| Archivo | Tipo | Eliminaciones |
|---|---|---|
| `Users/Users.jsx` | `console.error` + comentarios | 2 + 3 |
| `Roles/Asignation.jsx` | `console.error` | 1 |
| `Groups/Groups.jsx` | Comentarios | 2 |
| `Groups/GroupView.jsx` | `console.error` + `console.warn` | 4 + 1 |
| `Exams/ExamView.jsx` | `console.error` | 3 |

> `Reports.jsx` y `Kardex.jsx` — **NO modificados** (módulo de Reportes, otro equipo).

### Auditoría Fase 2: LIMPIO ✅

```
1. Referencias residuales a FormModals: NINGUNA
2. console.* en scope: NINGUNO
3. Componentes en Components/[Exams|Groups|Roles|Users]: 8 archivos confirmados
4. FormModals/ en Pages/: ELIMINADAS (3 carpetas)
5. Imports @/Components/ en 4 vistas: 8 líneas confirmadas
```

---

## FASE 3 — Back-End: Thin Controllers (Group, Exam, Qualification) ✅

Se aplicó el principio de Responsabilidad Única (SRP) para aligerar los controladores principales y aislar la lógica.

### 1. Form Requests Creados (5)
- `StoreExamRequest`
- `UpdateUnitsGroupRequest`
- `BulkUnenrollRequest`
- `BulkUpdateExamStatusRequest`
- `UpdateExamPivotRequest`

### 2. Actions Creadas (4) en `app/Actions/`
- `EnrollStudentsInGroup`
- `UpdateGroupEvaluableUnits`
- `EnrollStudentsInExam`
- `BulkUpdateExamQualifications`

### 3. Controladores Refactorizados
- `GroupController.php`: Lógica pesada extraída a Actions. `enroll()`, `updateUnits()` ahora son delegadores.
- `ExamController.php`: Validación eliminada, `store()`, `update()`, `enroll()` y masivos ahora delegan a Requests y Actions. Deuda técnica de `new_status` corregida.
- `QualificationController.php`: Código muerto (métodos void) eliminado. Orquestación refactorizada.

---

## FASE 4 — Auditoría de Limpieza en `Components/` ✅

### 1. Eliminación de Código Muerto y Duplicado
- Eliminado `Components/Charts/Modal.jsx` (duplicado funcional del modal de Breeze).
- Eliminado `Components/ui/Alert.jsx` (componente sin consumidores).
- Componente `ModalAlert.jsx` refactorizado para usar el modal oficial de Breeze (`@/Components/Modal`).

### 2. Eliminación de debugs nativos en Hooks
- Eliminados varios `alert()` nativos residuales en `Hooks/useBulkActions.jsx` y `Hooks/useDynamicColumns.jsx`. (Nota: previamente habían sido erradicados).

### 3. Reagrupación Lógica (5 Archivos) y Actualización de Imports
Componentes sueltos en la raíz de `Components/` se movieron a sus dominios lógicos:
- `ConfirmModal.jsx` → `Components/ui/`
- `ThemeButton.jsx` → `Components/ui/`
- `ThemeInput.jsx` → `Components/ui/`
- `ResourceDashboard.jsx` → `Components/Resource/`
- `DashboardHeader.jsx` → `Components/Menus/`

Se actualizaron **más de 30 rutas de importación** en `Pages/` y otros `Components/` satisfactoriamente.

---

## FASE 5 — Auditoría de Controladores Secundarios ✅

Se evaluaron todos los controladores secundarios pendientes para identificar código muerto, validaciones inline y rutas huérfanas.

### 1. Identificación de Grupo A (Controladores sin Rutas Activas)
Se añadió un bloque `@todo` en los siguientes controladores advirtiendo que sus métodos void aún no están conectados a `web.php` y poseen validaciones inline a limpiar:
- `LevelController.php`
- `DocumentController.php`
- `TypeStudentController.php`
- `ServiceController.php`

### 2. Limpieza en Grupo B (Limpieza Menor)
- `DegreeController.php`: Documentados métodos void con `@todo`, se eliminaron comentarios basura. Conservó su ruta activa de sandbox (`getDegree`).
- `ProfileController.php`: Extracción de validación inline en el método `destroy()` mediante la creación del FormRequest: `DeleteProfileRequest`.
- `RoleController.php`: Se eliminaron los métodos vacíos / skeleton generados por defecto por Artisan que no tenían ruta activa (`create()`, `show()`, `edit()`).

### 3. Corrección de Rutas en `web.php`
- Se corrigió la ruta GET `/kardex` que estaba apuntando erróneamente a `Test_Vik/Kardex` (herencia obsoleta pre-Fase 1). Ahora renderiza correctamente `Exams/Kardex`.

---

---

## FASE 6 — Hardening de Seguridad: Homologación Grupos ↔ Exámenes y Auditoría de Autorización ✅

Se implementó un ciclo integral de auditoría y hardening de seguridad en los módulos de **Grupos**, **Exámenes** y **Calificaciones**, aplicando la pauta de defensa en profundidad (Defense in Depth) y validación de autorización en capas: middleware → Policy → FormRequest → Controller.

### 1. Implementación de Patrón scopeVisibleToUser

Se creó e implementó el patrón `scopeVisibleToUser()` en modelos para filtrado de visibilidad basado en rol **antes de serialización**.

| Modelo | Método | Línea | Descripción |
|---|---|---|---|
| `app/Models/Group.php` | `scopeVisibleToUser()` | 70 | Admin/Coordinator: sin restricción. Teacher: filtrado por propiedad. Student: filtrado por inscripción activa. |
| `app/Models/Exam.php` | `scopeVisibleToUser()` | 73 | Idéntica lógica espejo a Group (NEW — implementación consistente). |

**Consumidores actualizados:**
- `AdminViewsController::groupsView()` → `Group::visibleToUser()` (línea 86)
- `AdminViewsController::examsView()` → `Exam::visibleToUser()` (línea 175)

---

### 2. Endurecimiento de Políticas (Policies)

Se auditaron y corrigieron comparaciones de identidad de docentes en **ExamPolicy** y **QualificationPolicy** (teacher.id vs user.id).

#### ExamPolicy — Correcciones Críticas

| Método | Línea | Antes | Después | Impacto |
|---|---|---|---|---|
| `view()` | 45-49 | `$exam->teacher_id == $user->id` | `$exam->teacher_id == $user->teacher?->id` | ✅ Previene que docentes vean exámenes ajenos. |
| `complete()` | 115-116 | Idéntica comparación errónea | `$exam->teacher_id == $user->teacher?->id` | ✅ Solo docente propietario puede completar. |

**Patrón aplicado:** Comparación siempre contra la relación `user.teacher.id`, nunca directamente `user.id`.

#### QualificationPolicy — Correcciones Alineadas

| Método | Línea | Cambio | Impacto |
|---|---|---|---|
| `view()` | 39 | Docente: `teacher.id === user.teacher.id` | ✅ Alineación de patrón. |
| `update()` | 53 | Docente: `teacher.id === user.teacher.id` | ✅ Alineación de patrón. |

---

### 3. Endurecimiento de Form Requests

| Request | Línea | Antes | Después | Impacto |
|---|---|---|---|---|
| `UpdateQualificationsRequest` | 13-14 | `['admin', 'teacher']` | `['admin', 'teacher', 'coordinator']` | ✅ Alineado con middleware `role:admin\|coordinator\|teacher` en web.php. |
| `BulkDeleteExamsRequest` | 18 | `return true` | `return $this->user()->hasAnyRole(['admin', 'coordinator'])` | ✅ Eliminada validación ausente; ahora protegida. |

---

### 4. Protección de Payloads Sensibles (Inertia Props)

Se implementó filtrado de catálogos y datos según rol del usuario **antes de envío al frontend**.

#### Disponibilidad de Estudiantes (availableStudents)

| Archivo | Línea | Cambio | Impacto |
|---|---|---|---|
| `GroupController::show()` | 111-149 | Condicional: `if (!Auth::user()?->hasRole('student')) { fetch availableStudents; }` | ✅ Estudiantes nunca ven catálogo de otros. |
| `ExamController::show()` | 111-112 | Idéntico patrón de protección | ✅ Consistencia Group ↔ Exam. |

#### Ocultamiento de Docentes (Revelación por Fecha)

| Vista | Línea | Método | Impacto |
|---|---|---|---|
| `AdminViewsController::groupsView()` | 91-98 | `ocultarDocentes` lógica | ✅ Docentes null si aún no ha pasado fecha revelación. |
| `AdminViewsController::examsView()` | 178-185 | Idéntica lógica espejo | ✅ Homologación completa. |

---

### 5. Validaciones de Auto-Acción en Controlador

Se agregó verificación adicional en operaciones de des-inscripción para estudiantes (prevención de actuación sobre terceros).

| Controlador | Método | Línea | Cambio | Impacto |
|---|---|---|---|---|
| `ExamController` | `unenroll()` | 152 | `if (Auth::user()->hasRole('student') && $student->user_id !== Auth::id()) { abort(403); }` | ✅ Estudiante solo puede desinscribirse a sí mismo. |

---

### 6. Alineación de Lógica UI (Frontend)

Se implementó gating (compuerta condicional) de acciones en el frontend basado en estado de recurso.

#### CardExam — Inscripción Gated por Status

| Archivo | Línea | Cambio | Impacto |
|---|---|---|---|
| `Components/Exams/CardExam.jsx` | 49 | `puedeInscribirse = examen.status === "enrolling"` | ✅ Botón de inscripción solo visible en fase ENROLLING. |
| `Components/Exams/CardExam.jsx` | 93 | `onInscribir={puedeInscribirse ? handleInscribir : undefined}` | ✅ Handler callback solo pasa si lógica permite. |

**Patrón aplicado:** UI condicionales siempre respaldadas por validación backend (payload protection + policy).

---

### 7. Documentación de Seguridad Creada

Se generaron manuales de seguridad espejo para **Grupos** y **Exámenes** con matrices de autorización y contrato de datos.

| Archivo | Propósito | Secciones |
|---|---|---|
| `docs/manual-grupos-seguridad-contrato.md` | Matriz de autorización para Group | Roles, Operaciones, Condiciones, Payload Visible, Scope Rules |
| `docs/manual-examenes-seguridad-contrato.md` | Matriz de autorización para Exam (NEW) | Idéntica estructura espejo para consistencia. |

**Cross-references:**
- Footer de manual-grupos apunta a manual-examenes (línea final).
- Ambos manuales siguen redacción técnica en español alineada con proyecto.

---

### 8. Resumen de Correcciones

| Categoría | Cantidad | Archivos Afectados |
|---|---|---|
| Políticas (Policies) endurecidas | 4 métodos | ExamPolicy, QualificationPolicy |
| Form Requests corregidas | 2 requests | UpdateQualificationsRequest, BulkDeleteExamsRequest |
| Scopes implementados | 2 modelos | Group, Exam |
| Controllers blindados | 2 métodos | GroupController, ExamController |
| Payloads protegidos | 4 props | availableStudents (Group/Exam), teacher (Group/Exam) |
| Componentes actualizados | 1 componente | CardExam.jsx |
| Documentación creada | 2 manuales | manual-grupos-seguridad-contrato.md, manual-examenes-seguridad-contrato.md |

---

## Estructura Final Conseguida
El proyecto cumple ahora estrictamente con:
- **Clean Architecture/SRP:** Vistas organizadas por dominios lógicos, componentes reusables bien ubicados limitando la duplicidad.
- **Thin Controllers:** Los controladores principales delegan carga transaccional hacia el paquete `Actions` y las validaciones de entrada a `FormRequests`.
- **Ausencia de Código Muerto Relevante:** Componentes y métodos inalcanzables o no utilizados han sido erradicados o bien identificados/documentados (`@todo`) de cara al futuro.
- **Defensa en Profundidad (Security):** Autorización validada en múltiples capas (middleware → Policy → FormRequest → Controller), scopeVisibleToUser filtra antes de serialización, payloads protegidos según rol, y UI respaldada por backend.
- **Homologación Arquitectónica:** Módulos Group y Exam con patrones idénticos (scope, payload protection, policy structure, documentation).
