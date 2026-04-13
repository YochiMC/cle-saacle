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

## Estructura Final Conseguida
El proyecto cumple ahora estrictamente con:
- **Clean Architecture/SRP:** Vistas organizadas por dominios lógicos, componentes reusables bien ubicados limitando la duplicidad.
- **Thin Controllers:** Los controladores principales delegan carga transaccional hacia el paquete `Actions` y las validaciones de entrada a `FormRequests`.
- **Ausencia de Código Muerto Relevante:** Componentes y métodos inalcanzables o no utilizados han sido erradicados o bien identificados/documentados (`@todo`) de cara al futuro.
