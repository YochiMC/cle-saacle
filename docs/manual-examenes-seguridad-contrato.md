# Manual de seguridad y contrato de datos del modulo de Examenes

## Proposito

Este documento describe el estado vigente del modulo de Examenes despues de los ajustes de seguridad y de consistencia entre backend y frontend.

La meta es mantener una sola fuente de verdad para:

- permisos por rol;
- datos expuestos a la UI;
- acciones permitidas en la vista de detalle;
- reglas de visibilidad del catalogo;
- regla de negocio de inscripcion por estado.

## Alcance

Aplica a estos puntos del flujo:

- listado de examenes (catalogo);
- detalle de examen (dashboard de calificaciones);
- reglas de inscripcion y baja;
- visibilidad de docentes para alumnos;
- acciones de captura en el frontend;
- logica de tarjetas (CardExam) para mostrar u ocultar inscripcion.

## Cambios implementados

### 1) Scope de visibilidad por rol para catalogo de examenes

Se implemento un scope de consulta en el modelo Exam para replicar el patron de Group.

Resultado:

- admin/coordinator: catalogo sin restriccion;
- teacher: solo examenes asignados;
- student: examenes disponibles por estado + historico propio;
- otros roles: sin visibilidad (fallback de seguridad).

### 2) Integracion del scope en AdminViews

La consulta de examsView ahora usa visibleToUser(user), igual que groupsView.

Resultado:

- la vista Exams/Index recibe examenes filtrados por rol desde backend;
- se evita depender solo de filtros en frontend.

### 3) Proteccion de datos en catalogo para rol alumno

Cuando aplica la regla de ocultar docente por fecha de revelacion:

- se limpia teacher/teacher_name en el payload de cada examen;
- el catalogo teachers se envia vacio para evitar filtracion por payload.

Resultado:

- no se expone informacion de docentes por inspeccion del objeto Inertia;
- la regla de negocio se cumple tanto en UI como en transporte de datos.

### 4) Hardening del detalle de examen

En ExamController::show se replica la misma proteccion de GroupController:

- availableStudents se envia vacio para rol student.

Resultado:

- se evita exponer el padron global de candidatos a inscripcion.

### 5) Hardening de baja individual de examen

En ExamController::unenroll se agrego validacion self-action para estudiante:

- student solo puede darse de baja a si mismo.

Resultado:

- se bloquea la posibilidad de desmatricular a terceros por URL manipulada.

### 6) Correccion de ownership docente en ExamPolicy

Se normalizo la comparacion del docente asignado:

- exam.teacher.id se compara contra user.teacher.id.

Resultado:

- evita falsos 403 al docente legitimo;
- alinea policy con el modelo relacional Teacher/User.

### 7) Defensa en profundidad para eliminacion masiva

BulkDeleteExamsRequest::authorize ya no usa return true:

- ahora valida admin/coordinator.

Resultado:

- request protegido incluso si se reutiliza fuera del flujo esperado.

### 8) Logica espejo en tarjetas de catalogo

CardExam replica la regla de Group:

- onInscribir solo se inyecta cuando examen.status === enrolling.

Resultado:

- la tarjeta oculta la accion de inscripcion para estados distintos de enrolling.

## Contrato de datos esperado

### Exams/Index

Props principales:

- examenes: lista filtrada por visibleToUser;
- teachers: catalogo de docentes (vacio cuando se ocultan docentes para student);
- periods, statuses, typeOptions, modeOptions.

### Exams/View

Props principales:

- examen: metadata del examen activo;
- enrolledStudents: alumnos inscritos con calificacion pivot;
- availableStudents: candidatos para inscripcion (vacio para student);
- levelsTecnm: catalogo derivado para UI.

## Matriz de seguridad (resumen operativo)

### Catalogo de examenes

- Admin y Coordinator: vista completa.
- Teacher: examenes asignados.
- Student: examenes disponibles por estado y examenes donde ya esta inscrito.

### Detalle de examen

- Student puede ver detalle solo de examenes donde esta inscrito.
- Teacher puede ver detalle de examenes asignados.
- Coordinator y Admin tienen acceso segun policy.

### Acciones en detalle

- Inscribir alumnos: Admin, Coordinator y Student (student solo su propio flujo desde request/controller).
- Baja individual: Coordinator; Student solo sobre si mismo.
- Baja masiva: Admin y Coordinator.
- Captura de calificaciones y cierre: Admin, Coordinator y Teacher segun rutas/policy.

## Buenas practicas que quedan establecidas

- Evitar filtros de seguridad solo en frontend; filtrar tambien en consulta backend.
- No confiar solo en ocultar componentes; proteger tambien el payload.
- Alinear policy + middleware + FormRequest + controller + UI.
- Usar enums como fuente de verdad para estados funcionales.
- Mantener contratos de datos estables para vistas Inertia.

## Checklist de verificacion recomendada

1. Entrar como alumno y validar que no exista catalogo de docentes en payload cuando aplica ocultamiento.
2. Validar que Exams/Index solo muestra examenes permitidos por rol.
3. Validar que Exams/View no expone availableStudents para student.
4. Validar que student no puede dar de baja a otro alumno en unenroll.
5. Validar que CardExam solo muestra inscripcion cuando status sea enrolling.
6. Ejecutar pruebas de navegacion por rol: admin, coordinator, teacher y student.

## Nota de mantenimiento

Si se agrega un nuevo rol o una nueva accion del modulo de Examenes, actualizar en el mismo cambio:

- policy correspondiente;
- middleware de rutas;
- authorize de FormRequest;
- condiciones de render en frontend;
- este documento de contrato de seguridad.

## Documentacion de codigo aplicada en el modulo

Para mantener trazabilidad entre documentacion funcional y documentacion in-file, este ajuste deja comentarios/bloques tecnicos en:

- app/Models/Exam.php (scope visibleToUser y reglas por rol).
- app/Http/Controllers/Views/AdminViewsController.php (uso de scope y proteccion de catalogos).
- app/Http/Controllers/ExamController.php (contrato de Exams/View y hardening de availableStudents/unenroll).
- app/Policies/ExamPolicy.php (matriz de autorizacion por rol y ownership docente).
- app/Http/Requests/BulkDeleteExamsRequest.php (defensa en profundidad en authorize).
- resources/js/Components/Exams/CardExam.jsx (ocultamiento de accion de inscripcion por status).
