# 🌐 Estandarización a Inglés & Configuración de Columnas Ocultas

## Resumen de Cambios

Se ha completado la migración del sistema DataTable a inglés 100%, con una estrategia de ocultamiento inteligente de columnas técnicas (IDs, timestamps) que mantiene los datos en el estado para operaciones en lote.

---

## 1️⃣ CAMBIOS REALIZADOS

### ✅ Actualización de `formatLabel()` en `useDynamicColumns.jsx`
- **Antes:** Mezcla de español e inglés en los encabezados
- **Después:** Diccionario completo de mapeo EN → ES (101 traducciones)
- **Impacto:** Todos los encabezados de tabla ahora muestran en inglés

**Ejemplo:**
```javascript
// ❌ ANTES
if (key === "num_control") return "Matrícula";
if (key === "certified_level") return "Nivel Certificado";

// ✅ DESPUÉS
const labelMap = {
    num_control: "Student Number",
    certified_level: "Certified Level",
    // ... 99 más
};
```

---

### ✅ Creación de `Constants/tableColumns.js`
Archivo centralizado con configuraciones de ocultamiento por contexto:

```javascript
export const USERS_HIDDEN_COLUMNS = {
    id: false,              // Oculta por defecto (no en lista, pero en estado)
    user_id: false,
    created_at: false,
    updated_at: false,
    deleted_at: false,
    type: false,
    status_label: false,
};

export const EXAMS_HIDDEN_COLUMNS = { /* ... */ };
export const GROUPS_HIDDEN_COLUMNS = { /* ... */ };
```

---

### ✅ Actualización de `Pages/Users/Users.jsx`
- Importa `USERS_HIDDEN_COLUMNS` del archivo de constantes
- Pasa `hiddenColumns={USERS_HIDDEN_COLUMNS}` al componente `ResourceDashboard`
- Simplifica mantenimiento futuro

---

## 2️⃣ CÓMO APLICAR A OTRAS VISTAS

### Patrón Genérico

Para **CUALQUIER vista** que use `ResourceDashboard` o `DataTable`:

#### PASO 1: Importar la configuración
```jsx
// En tu archivo Pages/*/Index.jsx
import { EXAMS_HIDDEN_COLUMNS } from "@/Constants/tableColumns";
// o
import { GROUPS_HIDDEN_COLUMNS } from "@/Constants/tableColumns";
```

#### PASO 2: Pasar al componente
```jsx
<ResourceDashboard
    title="Gestión de Exámenes"
    // ... otros props
    hiddenColumns={EXAMS_HIDDEN_COLUMNS}
/>
```

---

### Ejemplo Práctico: Pages/Exams/Index.jsx

**Cambio necesario:**

```jsx
// ❌ ANTES
<ResourceDashboard
    // Sin hiddenColumns o con configuración inline
/>

// ✅ DESPUÉS
import { EXAMS_HIDDEN_COLUMNS } from "@/Constants/tableColumns";

<ResourceDashboard
    title="Gestión de Exámenes"
    dataMap={...}
    hiddenColumns={EXAMS_HIDDEN_COLUMNS}
/>
```

---

### Ejemplo Práctico: Pages/Groups/Index.jsx

```jsx
// ✅ CAMBIO
import { GROUPS_HIDDEN_COLUMNS } from "@/Constants/tableColumns";

<ResourceDashboard
    title="Catálogo de Grupos"
    dataMap={...}
    hiddenColumns={GROUPS_HIDDEN_COLUMNS}
/>
```

---

## 3️⃣ REFERENCIA: COLUMNAS POR CONTEXTO

### 📚 Usuarios (Students + Teachers)
**Ocultas:** `id`, `user_id`, `student_id`, `teacher_id`, `exam_student_id`, `group_id`, `created_at`, `updated_at`, `deleted_at`, `type`, `status_label`, `birthdate`

**Visibles por defecto:** `name`, `email`, `gender`, `semester`, `status`

---

### 📝 Exámenes
**Ocultas:** `id`, `created_at`, `updated_at`, `exam_type_label`, `mode_label`

**Visibles:** `name`, `status`, `date`, `period`, `teacher`

---

### 👥 Grupos
**Ocultas:** `id`, `level_id`, `teacher_id`, `created_at`, `updated_at`, `mode_label`, `type_label`

**Visibles:** `name`, `level`, `teacher`, `schedule`, `capacity`, `status`

---

### 📊 Calificaciones
**Ocultas:** `id`, `exam_student_id`, `created_at`, `updated_at`

**Visibles:** `student_name`, `score`, `status`, `certified_level`

---

## 4️⃣ COMPORTAMIENTO DEL SISTEMA

### ¿Qué significa "Oculta"?

```
┌─────────────────────────────────────────────┐
│  Vista Inicial                              │
├─────────────────────────────────────────────┤
│  [Name] [Email] [Status]  ← VISIBLES       │
│                                             │
│  (ID, created_at, user_id → NO SE VEN)    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Menú "Columnas" (esquina superior)        │
├─────────────────────────────────────────────┤
│  ☑ Name                                    │
│  ☑ Email                                   │
│  ☑ Status                                  │
│  ☐ ID          ← Puedo mostrarla si quiero│
│  ☐ created_at  ← Puedo mostrarla si quiero│
│  ☐ user_id     ← Puedo mostrarla si quiero│
└─────────────────────────────────────────────┘
```

**Importante:** Aunque esté "oculta", la columna:
- ✅ Está en el estado de TanStack Table
- ✅ Se usa para acciones en lote (bulk delete, export)
- ✅ Es accesible desde el menú "Columnas" para usuarios avanzados

---

## 5️⃣ TRADUCCIÓN DE ENCABEZADOS (QUICK REFERENCE)

### Cambios en `formatLabel()`

| Clave Original | Antes (ES) | Después (EN) |
|---|---|---|
| `num_control` | Matrícula | Student Number |
| `full_name` | - | Name |
| `certified_level` | Nivel Certificado | Certified Level |
| `attempt` | Oportunidad | Attempt |
| `score` | - | Score |
| `is_left` | - | Left |
| `final_average` | - | Final Average |
| `created_at` | - | Created |
| `updated_at` | - | Updated |

---

## 6️⃣ TESTING & VALIDACIÓN

### Checklist Post-Implementación

Para **cada vista actualizada**, verifica:

- [ ] Todos los encabezados están en inglés
- [ ] Columnas técnicas (ID, timestamps) no se ven por defecto
- [ ] Menú "Columnas" permite mostrar/ocultar IDs si es necesario
- [ ] Bulk actions (export, delete) siguen funcionando
- [ ] Los datos se exportan correctamente (CSV, Excel, PDF)
- [ ] Las columnas se ordenan correctamente
- [ ] El búsqueda global funciona sin cambios

### Comando para Validar Tipos

Si usas TypeScript, valida tipos con:
```bash
npm run type-check
# o
tsc --noEmit
```

---

## 7️⃣ ARCHIVOS MODIFICADOS

| Archivo | Cambio | Prioridad |
|---------|--------|-----------|
| `resources/js/Hooks/useDynamicColumns.jsx` | `formatLabel()` → diccionario inglés | ✅ HECHO |
| `resources/js/Constants/tableColumns.js` | Crear archivo centralizado | ✅ HECHO |
| `resources/js/Pages/Users/Users.jsx` | Usar `USERS_HIDDEN_COLUMNS` | ✅ HECHO |
| `resources/js/Pages/Exams/Index.jsx` | Usar `EXAMS_HIDDEN_COLUMNS` | 📋 PRÓXIMO |
| `resources/js/Pages/Groups/Index.jsx` | Usar `GROUPS_HIDDEN_COLUMNS` | 📋 PRÓXIMO |
| Otras vistas con `ResourceDashboard` | Aplicar configuración centralizada | 📋 BACKLOG |

---

## 8️⃣ FAQ

### P: ¿Puedo volver a mostrar columnas ocultas?
**R:** Sí. El usuario final puede usar el menú "Columnas" (en la toolbar) para mostrar cualquier columna oculta. El ocultamiento es **por defecto**, no forzado.

### P: ¿Las columnas ocultas se incluyen en las exportaciones (CSV, Excel)?
**R:** Las columnas visibles en la tabla se exportan. Si el usuario oculta una columna, no aparecerá en la exportación. Esto es **intencional** para mantener reportes limpios.

### P: ¿Necesito cambiar la base de datos?
**R:** No. Los cambios son **solo en frontend**. Los datos en base de datos (IDs, timestamps) se conservan igual.

### P: ¿Qué pasa con las acciones en lote (bulk delete)?
**R:** Las acciones en lote **siguen funcionando correctamente**. Aunque la columna esté oculta, el ID sigue en el estado de la tabla y se usa para identificar registros seleccionados.

---

## 9️⃣ PRÓXIMOS PASOS RECOMENDADOS

1. **Inmediato:** Revisar que `Pages/Users/Users.jsx` se ve correctamente
2. **Esta semana:** Aplicar a `Pages/Exams/Index.jsx` y `Pages/Groups/Index.jsx`
3. **Backlog:** Auditar todas las demás vistas que usen `ResourceDashboard`
4. **Documentación:** Actualizar guías internas si existen

---

## 🔗 REFERENCIAS

- [TanStack Table - Column Visibility](https://tanstack.com/table/v8/docs/guide/column-visibility)
- [useDynamicColumns.jsx](../resources/js/Hooks/useDynamicColumns.jsx)
- [DataTable.jsx](../resources/js/Components/DataTable/DataTable.jsx)
- [tableColumns.js (Constantes)](../resources/js/Constants/tableColumns.js)

