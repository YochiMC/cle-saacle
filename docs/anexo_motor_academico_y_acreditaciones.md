# ⚙️ Motor Académico, Máquina de Estados y Módulo de Acreditaciones

## Resumen de Cambios

Se ha refactorizado profundamente el núcleo del sistema escolar para garantizar la **Integridad Referencial**, implementar una **Máquina de Estados Reversible**, optimizar el rendimiento de las consultas y establecer las bases del nuevo Módulo de Acreditaciones siguiendo los principios SOLID y Clean Architecture.

---

## 1️⃣ MÁQUINA DE ESTADOS Y REVERSIBILIDAD

### ✅ Creación de `RevertStudentsLevelAction` y Observers
- **Problema:** Al reabrir un grupo o examen (pasar de `completado` a `activo`), los alumnos conservaban el nivel y estado que habían ganado, rompiendo el historial académico.
- **Solución:** Se implementó una lógica de "viaje en el tiempo". Los `GroupObserver` y `ExamObserver` detectan la transición inversa usando `$model->getOriginal('status')`.
- **Impacto:** Si un administrativo se equivoca y reabre un grupo, el sistema automáticamente:
  1. Regresa al alumno a su estado anterior (`VALIDATED` o `IN_REVIEW`).
  2. Le retira el nivel asignado (solo si coincide con el obtenido en ese examen específico).

### ✅ Prevención de "Registros Huérfanos" (Baja de Alumnos)
- **Problema:** Al dar de baja a un alumno (Unenroll), se rompía la tabla pivote pero sus calificaciones se quedaban en la base de datos, bloqueando futuras inscripciones.
- **Solución:** Se creó `UnenrollStudentAction.php`.
- **Impacto:** Ahora, la baja individual y masiva (`BulkUnenrollStudentsFromGroup`) elimina físicamente el registro en `qualifications`, hace el `detach()`, y restaura el estado del alumno a `VALIDATED` dentro de una transacción ACID segura.

---

## 2️⃣ REGLAS DE NEGOCIO Y DOMINIO (CLE)

### ✅ Intercepción de Niveles Terminales (`AdvanceStudentsLevelAction`)
- **Antes:** Al aprobar cualquier nivel, el sistema intentaba subir al alumno al nivel siguiente + 1.
- **Después:** Se programó el cierre de ciclo (End-of-Life cycle).
- **Regla:** Si un alumno aprueba **Intermedio 5**, un programa de **Egresados**, o un **Examen de 4 Habilidades/Convalidación**, el sistema **NO** lo sube de nivel. En su lugar, cambia su estatus a `IN_REVIEW` (En Revisión) para enviarlo automáticamente a la bandeja de acreditaciones.

### ✅ Normalización de Base de Datos (Acreditaciones)
- **Acción:** Se eliminaron las columnas `accreditation_source` y `accreditation_date` de la tabla `students`.
- **Acción:** Se modificó la tabla `students` para que `level_id` sea `nullable` (resolviendo el Error 1048).
- **Razón:** Un estudiante "es" una persona; la acreditación "es" un trámite. Un alumno de nuevo ingreso o con trámite cancelado puede existir temporalmente sin nivel.

---

## 3️⃣ MÓDULO DE ACREDITACIONES (UI/UX & BACKEND)

### ✅ Cálculo Dinámico de Datos (Single Source of Truth)
- Al eliminar las columnas físicas de acreditación, el `AccreditationCandidateResource` fue reescrito para funcionar como un DTO real.
- **Comportamiento:** Calcula dinámicamente "Achieved By" (Acreditado por) y "Obtained At" (Obtenido en) inspeccionando el último examen o grupo aprobado por el alumno en tiempo real.

### ✅ Optimización de Rendimiento (N+1 y SQL Indexes)
- **Backend:** Se implementó *Eager Loading* estricto (`->with(['exams.period', 'qualifications.group.period'])`) en `GetAccreditationCandidates.php` reduciendo drásticamente las consultas.
- **Base de Datos:** Se ejecutó la migración `add_performance_indexes_for_accreditations` agregando índices B-Tree a `period_id`, `student_id` y `group_id`.
- **Impacto:** Las subconsultas (`whereHas`) para filtrar periodos ahora se ejecutan en milisegundos.

### ✅ Re-maquetación de Filtros y Reactividad
- **Frontend:** Se construyó una Toolbar (Barra de Herramientas) con Tailwind CSS (`flex md:flex-row items-end gap-4`), integrando el filtro de Periodos sin romper la estética.
- **UX Resiliente:** En `ResourceDashboard.jsx`, se garantizó que los filtros permanezcan visibles en pantalla incluso cuando una búsqueda devuelve 0 registros, permitiendo al usuario limpiar su búsqueda.
- **Bug Fix:** Se solucionó el error de *Ziggy Routing* reemplazando la función `route()` por la ruta absoluta `/acreditaciones` en Inertia.

---

## 4️⃣ INTERNACIONALIZACIÓN Y TRADUCCIONES (ESPAÑOL)

| Componente/Atributo | Antes (EN) | Después (ES) | Ubicación |
|---|---|---|---|
| Estatus de Alumno | Disabled | Inhabilitado | `StatusBadge.jsx`, `StudentStatus.php` |
| Filtros Select | All Statuses | Todos los estados | `AccreditationFilters.jsx` |
| Alertas (Toasts) | Success / Error | Mensajes localizados | `AccreditationController.php` |
| Modal de Acción | Confirm / Cancel | Confirmar / Cancelar | `ConfirmModal.jsx`, `AccreditationModals.jsx` |

---

## 5️⃣ ARCHIVOS CLAVE MODIFICADOS

| Capa | Archivo | Responsabilidad Principal |
|---|---|---|
| **Acciones** | `RevertStudentsLevelAction.php` | Lógica de viaje en el tiempo para estados y niveles. |
| **Acciones** | `UnenrollStudentAction.php` | Limpieza profunda de historiales huérfanos. |
| **Acciones** | `AdvanceStudentsLevelAction.php` | Reglas de promoción e intercepción (Intermedio 5). |
| **Observers** | `GroupObserver.php` / `ExamObserver.php` | Detección de cambios de estatus (Completado <-> Activo). |
| **Recursos** | `AccreditationCandidateResource.php` | DTO dinámico para historial de acreditaciones. |
| **Frontend** | `useAccreditationManager.js` | Sincronización de estado UI con Inertia (Sin Ziggy). |
| **Frontend** | `ResourceDashboard.jsx` | Lógica de renderizado condicional para Empty States. |
| **Base de Datos**| `2026_05_09_180729_add_performance_indexes...` | Índices SQL para acelerar filtros de periodo. |

---

## 6️⃣ TESTING & VALIDACIÓN POST-IMPLEMENTACIÓN

- [x] Al reabrir un grupo, los alumnos pierden el nivel ganado y regresan a estado válido.
- [x] Al aprobar Intermedio 5, el alumno pasa a `IN_REVIEW` en lugar de buscar un "Nivel 6".
- [x] La baja de un alumno limpia su registro en `qualifications`.
- [x] La tabla de Acreditaciones carga rápidamente gracias a los índices.
- [x] Los filtros de Periodo y Estado funcionan sin arrojar error 500.
- [x] El término institucional "Inhabilitado" se refleja en toda la UI.
- [x] La selección múltiple (checkboxes) se limpia automáticamente tras una acción en lote.
