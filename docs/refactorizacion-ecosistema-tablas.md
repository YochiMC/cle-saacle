# 🏗️ Refactorización del Ecosistema de Tablas Dinámicas

**Versión:** 1.0  
**Autor:** Arquitectura de Software - CLE-SaaCLE  
**Estado:** Finalizado  

---

## 📝 Resumen Ejecutivo

Este documento detalla la transformación arquitectónica del sistema de gestión de recursos. Hemos migrado de una estructura monolítica basada en un **"God Hook"** (`useResourceManagement`) altamente acoplado, hacia un ecosistema modular basado en **Clean Architecture**, aplicando el **Patrón Fachada** y el patrón de diseño **Smart/Dumb Components**.

Esta refactorización garantiza que el sistema sea escalable, fácil de testear y robusto ante cambios en los requerimientos de negocio, manteniendo una visualización determinista y de alto rendimiento.

---

## 🚀 Desglose de las 8 Fases de Refactorización

### 🔹 Fase 1: Estabilización de Reactividad
Se saneó el núcleo de visualización en `DataTable.jsx`. Se eliminaron las dependencias inestables en los hooks de **TanStack Table** (como pasar el objeto `table` completo a los `useMemo`), sustituyéndolas por dependencias primitivas y estables (`rowSelection`, `globalFilter`). Esto eliminó los re-renders en cascada que degradaban el rendimiento.

### 🔹 Fase 2: Modularización de Paginación (`useTablePagination.jsx`)
Se extrajo la lógica de navegación. Se implementó un **"Guardia de Límites"** inteligente que ajusta la página actual solo cuando es estrictamente necesario (ej. al eliminar el último registro de una página), evitando el comportamiento agresivo de resetear siempre a la página 1.

### 🔹 Fase 3: Gestión de Filtros (`useTableFilters.jsx`)
Se centralizó la lógica de filtrado. El uso de **actualizaciones funcionales** y `useCallback` garantiza que las funciones de filtrado mantengan referencias estables, eliminando problemas de *stale closures* y garantizando que los filtros siempre operen sobre el estado más reciente.

### 🔹 Fase 4: Orquestación de Modales (`useTableModals.jsx`)
Aplicando el **Principio de Abierto/Cerrado (OCP)**, se inyectó una configuración de comportamiento (`behaviorConfig`). El hook ahora es agnóstico a los nombres técnicos de los modales, permitiendo extender la UI sin modificar la lógica interna del hook.

### 🔹 Fase 5: Aislamiento de Selección (`useTableSelection.jsx`)
Se desacopló el estado de selección de filas. Se implementaron actualizaciones inmutables seguras para los checkboxes, permitiendo que la selección masiva sea reactiva y performante, independiente de la carga de datos principal.

### 🔹 Fase 6: Capa de Red e Infraestructura (`useResourceNetwork.jsx`)
Se aislaron todas las llamadas HTTP y de **Inertia.js**. Con esta extracción, el hook original `useResourceManagement.jsx` se transformó en un **Patrón Fachada (Facade)** puro, que solo orquesta los sub-hooks especializados sin conocer los detalles de implementación de cada uno.

### 🔹 Fase 7 y 8: Columnas Dinámicas y Smart/Dumb Pattern
Se desacopló totalmente el dominio de negocio de la lógica de renderizado.
- **`useDynamicColumns.jsx`**: Ahora es una pieza de infraestructura pura que genera columnas basadas en datos, sin conocer entidades como "estudiantes" o "docentes".
- **`ResourceDashboard.jsx`**: Se convirtió en un **Dumb Component** (presentacional) que recibe toda su inteligencia a través de la prop `columnConfig`.
- **Inyección de Dependencias**: La lógica de negocio y el ordenamiento de columnas se delegó a los **Smart Components** (Padres) como `Users.jsx`, `Exams/View.jsx` y `Groups/View.jsx`, quienes inyectan la configuración mediante `useMemo` para garantizar estabilidad referencial.

---

## 🛠️ Guía Rápida para Desarrolladores

Para implementar una nueva tabla dinámica en el proyecto, siga estos pasos:

### 1. Definir la Configuración en el Smart Component (Vista)
Cree un objeto de configuración estable dentro de su página de Inertia:

```javascript
// En MiPagina/View.jsx
const miConfiguracion = useMemo(() => ({
    baseKeys: ["id", "nombre", "codigo"], // Columnas fijas al inicio
    statusKeys: ["is_active"],           // Columnas de estado
    footerKeys: ["total"],               // Columnas al final
    ignoredKeys: new Set(["user_id"]),   // Metadatos ocultos
    customOrder: (keys) => {             // Lógica de ordenamiento personalizada
        const priority = ["codigo", "nombre"];
        return [...new Set([...priority, ...keys])];
    }
}), []);
```

### 2. Importar Diccionarios
Utilice `tableDictionary.js` para mantener las etiquetas y llaves estandarizadas en todo el ecosistema.

### 3. Inyectar en ResourceDashboard
Pase la configuración al componente Dumb:

```jsx
<ResourceDashboard
    title="Mi Nueva Tabla"
    dataMap={{ principal: data }}
    columnConfig={miConfiguracion}
    // ... otras props
/>
```

---

## 💎 Beneficios Obtenidos
- ✅ **Mantenibilidad**: Cada pieza de lógica tiene una única responsabilidad (SRP).
- ✅ **Rendimiento**: Referencias estables y memorización agresiva para evitar renders innecesarios.
- ✅ **Consistencia**: Un solo lenguaje visual y funcional para todas las tablas del sistema.
- ✅ **Escalabilidad**: Añadir nuevas funcionalidades (como exportación o filtros avanzados) ahora solo requiere modificar un sub-hook específico.
