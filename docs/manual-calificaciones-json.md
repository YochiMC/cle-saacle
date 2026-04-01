# Manual de calificaciones con JSON

## Propósito

Este proyecto maneja las calificaciones con una sola columna JSON llamada `units_breakdown`. La intención es evitar columnas fijas cuando los grupos pueden tener distinta cantidad de unidades.

Con este enfoque, la estructura de la calificación se adapta al grupo, y el frontend solo consume la información que el backend le entrega.

## Qué se cambió

Los cambios se enfocaron en mantener una sola fuente de verdad para la calificación:

- el modelo `Qualification` conserva `units_breakdown` como `array`;
- la migración guarda el desglose en una columna `json`;
- el factory genera un arreglo PHP real, no un `json_encode()`;
- el resource devuelve `units_breakdown` para que la vista lo procese;
- `GroupView` aplana el JSON y genera columnas dinámicas;
- `ResourceDashboard` y `useDynamicColumns` habilitan edición global;
- los controladores y requests validan y guardan el mismo formato.

## Estructura de la calificación

La tabla `qualifications` guarda esta información:

- `units_breakdown`: desglose de unidades en JSON.
- `final_average`: promedio final calculado.
- `is_approved`: estado de aprobación.
- `is_left`: estado de baja o abandono.
- `student_id`: relación con el alumno.
- `group_id`: relación con el grupo.

Ejemplo de `units_breakdown`:

```json
{
  "unit_1": 85,
  "unit_2": 90,
  "unit_3": 78
}
```

## Flujo de lectura

### 1. El grupo carga sus calificaciones

`GroupController` consulta las calificaciones del grupo y carga la relación `student`.

### 2. El resource prepara los datos

`StudentQualificationResource` entrega al frontend:

- datos del alumno;
- `qualification_id`;
- `units_breakdown`;
- `final_average`;
- `is_approved`;
- `is_left`.

El objetivo es que la vista no dependa de columnas fijas.

### 3. La vista aplana la estructura JSON

`GroupView` toma `units_breakdown`, lo convierte en columnas de primer nivel y arma la fila final.

Si el JSON trae `unit_1`, `unit_2` y `unit_3`, la tabla recibe esas claves como columnas visibles.

### 4. La tabla genera columnas dinámicas

`ResourceDashboard` pasa el dataset activo a `useDynamicColumns`.

Ese hook detecta las keys del primer registro y crea las columnas automáticamente.

## Flujo de edición

### Captura global

Cuando se presiona `Capturar Calificaciones`:

1. `GroupView` activa el modo global.
2. `ResourceDashboard` lo transmite al generador de columnas.
3. `useDynamicColumns` habilita las celdas editables en todas las filas.
4. Al cambiar una unidad, `GroupView` recalcula `final_average` e `is_approved`.
5. Al guardar, el frontend serializa la fila y envía `units_breakdown` al backend.

### Edición individual

También sigue disponible la edición fila por fila.

En ese flujo, la celda solo se habilita para la fila seleccionada y el guardado usa el mismo formato JSON.

## Archivos ajustados

### [database/factories/QualificationFactory.php](../database/factories/QualificationFactory.php)

El factory ahora genera `units_breakdown` como arreglo PHP.

Buenas prácticas aplicadas:

- no usar `json_encode()` antes de guardar;
- dejar que el cast del modelo convierta el arreglo a JSON;
- calcular el promedio con base en las unidades generadas.

### [app/Models/Qualification.php](../app/Models/Qualification.php)

Este modelo conserva el cast correcto para `units_breakdown`.

Puntos clave:

- `units_breakdown` usa `array`;
- la relación con `student` y `group` sigue intacta.

### [app/Http/Resources/StudentQualificationResource.php](../app/Http/Resources/StudentQualificationResource.php)

Este resource traduce la calificación a un formato útil para la vista.

Ahora regresa `units_breakdown` en lugar de campos fijos como `unit_1` y `unit_2`.

### [app/Http/Controllers/GroupController.php](../app/Http/Controllers/GroupController.php)

Este controlador carga las calificaciones del grupo y crea registros iniciales con JSON coherente.

Al inscribir alumnos, se genera un `units_breakdown` por defecto para que la tabla tenga una estructura base.

### [app/Http/Controllers/QualificationController.php](../app/Http/Controllers/QualificationController.php)

Este controlador valida y guarda la calificación usando el formato JSON.

Cambios aplicados:

- validación de `units_breakdown` como arreglo;
- eliminación de campos fijos en la actualización;
- guardado completo del desglose en bulk update.

### [app/Http/Requests/UpdateQualificationsRequest.php](../app/Http/Requests/UpdateQualificationsRequest.php)

Este request valida la actualización masiva.

Cada fila debe traer:

- `qualification_id`;
- `units_breakdown`;
- `final_average`;
- `is_approved`;
- `is_left`.

### [resources/js/Pages/Test_MK2/GroupView.jsx](../resources/js/Pages/Test_MK2/GroupView.jsx)

Esta vista concentra la lógica visual de las calificaciones.

Lo que hace ahora:

- normaliza `units_breakdown`;
- genera columnas `unit_*` de forma dinámica;
- habilita el modo de captura global;
- recalcula el promedio al editar una unidad;
- serializa el objeto antes de enviarlo al servidor.

### [resources/js/Components/ResourceDashboard.jsx](../resources/js/Components/ResourceDashboard.jsx)

Este componente recibe el estado global de edición y lo pasa al sistema de columnas.

Se mantuvo como contenedor general para no mover lógica específica al componente de tabla.

### [resources/js/Hooks/useDynamicColumns.jsx](../resources/js/Hooks/useDynamicColumns.jsx)

Este hook genera la definición de columnas a partir de los datos reales.

También reconoce el modo global de captura para habilitar inputs en todas las filas.

## Reglas que conviene respetar

- no volver a usar columnas fijas para cada unidad;
- no usar `json_encode()` en factories;
- no saltarse el resource al preparar datos para la vista;
- mantener alineados modelo, request, controlador y frontend;
- recalcular el promedio siempre que cambie una unidad.

## Resumen

La implementación quedó organizada para trabajar con una sola tabla de calificaciones y un JSON flexible por grupo.

Con esto se logró:

- mayor flexibilidad para distintos tipos de grupo;
- menos cambios en base de datos;
- tabla dinámica en frontend;
- edición global e individual con el mismo formato;
- una estructura más fácil de mantener.
