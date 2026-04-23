# Manual de seguridad y contrato de datos del modulo de Grupos

## Proposito

Este documento describe el estado vigente del modulo de Grupos despues de los ajustes de seguridad y de consistencia entre backend y frontend.

La meta es mantener una sola fuente de verdad para:

- permisos por rol;
- datos expuestos a la UI;
- acciones permitidas en la vista de detalle;
- reglas de visibilidad del catalogo.

## Alcance

Aplica a estos puntos del flujo:

- listado de grupos (catalogo);
- detalle de grupo (dashboard de calificaciones);
- reglas de inscripcion y baja;
- visibilidad de docentes para alumnos;
- acciones de captura en el frontend.

## Cambios implementados

### 1) Flujo unico para detalle de grupo

Se elimino el metodo legado de detalle en el controlador de vistas administrativas para evitar dos contratos distintos hacia la misma vista.

Resultado:

- el detalle operativo queda centralizado en GroupController;
- se elimina la posibilidad de mezclar datos mock con datos reales;
- se reduce riesgo de desalineacion entre permisos y payload.

### 2) Proteccion de datos en catalogo para rol alumno

Cuando aplica la regla de ocultar docente por fecha de revelacion:

- la relacion teacher se limpia en cada grupo antes de serializar;
- el catalogo teachers se envia vacio para evitar filtracion por payload.

Resultado:

- no se expone informacion de docentes por inspeccion del objeto Inertia;
- la regla de negocio se cumple tanto en UI como en transporte de datos.

### 3) Correccion del filtro de estados visibles para alumnos

El scope de visibilidad usa estados oficiales del enum AcademicStatus.

Resultado:

- se eliminan estados no validos en consultas;
- el listado de grupos para alumno queda alineado al catalogo oficial.

### 4) Permisos de UI alineados con backend

En la vista de detalle de grupo se separaron permisos de interfaz:

- canEditQualifications para captura y cierre academico;
- canEnrollStudents solo para roles autorizados a inscripcion.

Resultado:

- la UI no muestra acciones que terminarian en 403;
- mejor experiencia para roles sin permisos de mutacion.

## Contrato de datos esperado (detalle de grupo)

Props esperadas en Groups/View:

- grupo: metadata del grupo activo.
- enrolledStudents: coleccion normalizada de alumnos inscritos con datos de calificacion.
- availableStudents: lista de alumnos disponibles para inscripcion.

Regla para availableStudents:

- si el usuario es alumno, el backend envia lista vacia.
- si el usuario es admin, coordinator o teacher, se envia lista segun politica/controlador.

## Matriz de seguridad (resumen operativo)

### Catalogo de grupos

- Admin y Coordinator: vista completa.
- Teacher: grupos asignados.
- Student: grupos disponibles por nivel y grupos historicos propios.

### Detalle de grupo

- Student puede ver detalle solo de grupos donde pertenece.
- Teacher puede ver detalle de sus grupos asignados.
- Coordinator y Admin tienen acceso segun policy.

### Acciones en detalle

- Inscribir alumnos: Admin y Coordinator (segun middleware, request y policy).
- Baja individual: Coordinator; Student solo sobre si mismo.
- Baja masiva: Admin y Coordinator.
- Captura de calificaciones y cierre: Admin, Coordinator y Teacher segun rutas/policy.

## Buenas practicas que quedan establecidas

- Evitar metodos legacy con payload alterno para la misma vista.
- No confiar solo en ocultar componentes; proteger tambien el payload en backend.
- Alinear policy + middleware + FormRequest + UI para evitar contradicciones.
- Usar enums como fuente de verdad para estados funcionales.
- Mantener comentarios y bloques de documentacion en espanol tecnico y orientados a flujo.

## Checklist de verificacion recomendada

1. Entrar como alumno y validar que no exista catalogo de docentes en payload cuando aplica ocultamiento.
2. Validar que la vista de detalle no muestre accion de inscripcion para roles no autorizados.
3. Confirmar que el listado de grupos de alumno refleja estados oficiales del enum.
4. Confirmar que no existen referencias a metodos legacy de detalle en rutas o controladores.
5. Ejecutar pruebas de navegacion por rol: admin, coordinator, teacher y student.

## Nota de mantenimiento

Si se agrega un nuevo rol o una nueva accion del modulo de Grupos, actualizar en el mismo cambio:

- policy correspondiente;
- middleware de rutas;
- authorize de FormRequest;
- condiciones de render en frontend;
- este documento de contrato de seguridad.

## Documentacion de codigo aplicada en el modulo

Para mantener trazabilidad entre documentacion funcional y documentacion in-file, este ajuste deja comentarios/bloques tecnicos en:

- app/Http/Controllers/GroupController.php (contrato de datos del detalle y criterio de seguridad de availableStudents).
- app/Policies/GroupPolicy.php (matriz de autorizacion por rol y nota de responsabilidades policy/controlador).
- app/Models/Group.php (descripcion del modelo y reglas del scope visibleToUser).
- resources/js/Pages/Groups/Hooks/useGroupManager.js (contrato del hook y separacion de permisos UI).
- resources/js/Pages/Groups/View.jsx (contrato de props esperado desde backend).
