# Módulo de Inscripciones (Autoinscripción)

Fecha: 2026-05-04

Resumen
-------
Esta documentación describe los cambios implementados para habilitar la ruta completa de pago → elegibilidad → autoinscripción de estudiantes en CLE SAACLE.

Objetivo
--------
- Permitir que los estudiantes suban comprobantes de pago para conceptos que coinciden con los tipos reales de grupos y exámenes.
- Que los pagos queden inicialmente en estado `pending` y requieran revisión administrativa.
- Al aprobar un pago, el sistema marque al estudiante como elegible para inscribirse.
- Proveer una vista de autoinscripción donde estudiantes elegibles, durante el período de inscripción activo, puedan elegir un grupo o un examen compatible con el concepto pagado.
- Automatizar la transición de estados cuando el período finalice.

Resumen de cambios (high level)
-------------------------------
- Enums:
  - `app/Enums/ServiceType.php`: ahora contiene conceptos alineados con `GroupType` y `ExamType` (`Regular`, `Intensivo`, `Semi intensivo`, `Programa Egresados`, `Convalidación`, `Planes anteriores`, `4 habilidades`, `Ubicación`).
  - `app/Enums/StudentStatus.php`: añadidos `ELEGIBLE_INSCRIPCION`, `ESPERA_INSCRIPCION`, `ESPERA`.

- Validaciones / Requests:
  - `app/Http/Requests/StoreServiceRequest.php`: ahora solo acepta los conceptos de pago soportados por `ServiceType`.
  - `app/Http/Requests/UpdateServiceRequest.php`: (mantiene la lógica de aprobación/rechazo por admin).

- Actions / Business logic:
  - `app/Actions/StoreStudentService.php`: persiste el servicio/pago en estado `PENDING` y marca al estudiante en `PAYMENT_REVIEW`.

- Observers:
  - `app/Observers/ServiceObserver.php`: cuando un `Service` cambia a `APPROVED`, actualiza el `Student.status` a `ELEGIBLE_INSCRIPCION`.
  - Observer registrado en `App\Providers\AppServiceProvider::boot()`.

- Controllers / Endpoints:
  - `app/Http/Controllers/SelfEnrollmentController.php`:
    - `enroll(Group $group, ...)`: valida que el usuario sea estudiante, que esté elegible, que el período esté activo, previene doble inscripción y permite cambio de grupo desinscribiendo previamente.
  - `app/Http/Controllers/Views/AdminViewsController.php`:
    - `studentEnrollmentView(...)`: arma el payload de inscripción con grupos y exámenes filtrados por el concepto pagado.

- Jobs / Scheduler:
  - `app/Jobs/RunAcademicStatusAutoUpdater.php`: detecta períodos vencidos, cierra grupos y cambia alumnos con `ESPERA_INSCRIPCION` a `ESPERA`.

- Frontend (Inertia + React):
  - `resources/js/Pages/Academic/StudentEnrollment.jsx`: nueva vista que muestra:
    - Estado de elegibilidad / período
    - Grupos disponibles agrupados por nivel con capacidad, profesor, horario
    - Exámenes disponibles con capacidad, profesor y horario de aplicación
    - Botón para inscribirse en grupo o examen según corresponda
  - `resources/js/Pages/Academic/Pagos.jsx`, `PaymentModal.jsx`, `ReviewModal.jsx`: actualizados para mostrar el concepto real que se va a pagar.

- Rutas añadidas (`routes/web.php`):
  - `GET /inscripcion` → `AdminViewsController@studentEnrollmentView` (name: `student.enrollment`, middleware: `role:student`).
  - `POST /grupos/{group}/auto-inscribir` → `SelfEnrollmentController@enroll` (name: `self-enroll`, middleware: `role:student`).

Arquitectura y razones de diseño
--------------------------------
- Separamos responsabilidades: observer para manejar efectos secundarios cuando un pago es aprobado; action para la persistencia del pago; controller para la lógica de inscripción y validaciones de negocio.
- Los estados nuevos en `StudentStatus` permiten modelar claramente el flujo: revisado por pago → elegible → espera de inscripción → espera cuando el período cierra.

Archivos clave y ubicación
-------------------------
- Enums:
  - `app/Enums/ServiceType.php`
  - `app/Enums/StudentStatus.php`

- Requests:
  - `app/Http/Requests/StoreServiceRequest.php`
  - `app/Http/Requests/UpdateServiceRequest.php`

- Observers:
  - `app/Observers/ServiceObserver.php`

- Actions:
  - `app/Actions/StoreStudentService.php`

- Controllers / Views:
  - `app/Http/Controllers/SelfEnrollmentController.php`
  - `app/Http/Controllers/Views/AdminViewsController.php` (método `studentEnrollmentView`)
  - `resources/js/Pages/Academic/StudentEnrollment.jsx`

- Rutas:
  - `routes/web.php` (entradas `student.enrollment` y `self-enroll`)

Cómo probar manualmente (paso a paso)
----------------------------------
Requerimientos previos:
- Un usuario con rol `student` y un estudiante asociado.
- Un `Period` activo con `start_date` ≤ hoy ≤ `end_date` y grupos con `status` = `ENROLLING`.

1) Subir comprobante (estudiante):
  - Accede a `GET /pagos` (vista `Pagos.jsx`) y crea un nuevo pago seleccionando el concepto correcto para el grupo o examen que deseas tomar.
   - Verifica que el `Service` quede con `status = pending` en la base de datos.

2) Aprobar pago (admin):
   - Como admin, entra a la lista de pagos pendientes y aprueba el pago.
   - Verifica que el `Service.status` cambie a `approved` y que el `student.status` cambie a `ELEGIBLE_INSCRIPCION` (observer).

3) Enroll (estudiante):
   - Accede a `GET /inscripcion`.
  - Si eres elegible y el período está activo, verás los grupos o exámenes disponibles según tu pago.
  - Selecciona un grupo o un examen y envía la inscripción correspondiente.
  - Verifica que el estudiante quede con `status = ESPERA_INSCRIPCION` cuando se trate de grupos y que el pivot del examen se cree cuando se trate de exámenes.

4) Cambio de grupo:
   - Repite la inscripción en otro grupo del mismo período. El controlador usa la acción `BulkUnenrollStudentsFromGroup` para desinscribir del grupo anterior antes de inscribir en el nuevo.

5) Cierre de período (Job):
   - Ejecuta el job de forma manual o scheduler: `php artisan schedule:run` (si está programado) o prueba directamente el job/command que invoque `RunAcademicStatusAutoUpdater`.
   - Verifica que al cerrarse el período, grupos cambien de `ENROLLING` a estado final y que estudiantes `ESPERA_INSCRIPCION` pasen a `ESPERA`.

Comandos útiles
--------------
 - Ver rutas relevantes:
```
php artisan route:list --name=student.enrollment
php artisan route:list --name=self-enroll
```

 - Compilar frontend (verificado durante la integración):
```
npm run build
```

Notas de QA y edge-cases
------------------------
- Si un estudiante sube un comprobante pero se selecciona un concepto no soportado por `ServiceType`, la validación de `StoreServiceRequest` rechazará la solicitud.
- Si el admin aprueba un pago que no tiene relación con un `student` válido, el observer ignora la actualización (se hace un `if ($service->student)`).
- El controlador de inscripción valida que el período asociado al grupo esté activo; si no lo está, la inscripción se rechaza.

Recomendaciones y mejoras futuras
---------------------------------
- Añadir notificaciones (email/in-app) cuando el pago sea aprobado y cuando el estudiante sea marcado como elegible.
- Mostrar en la UI el historial de pagos y el estado de elegibilidad con timestamps.
- Añadir tests automatizados (Feature tests) que cubran:
  - Flujo de subida de pago → aprobación → elegibilidad
  - Flujo de autoinscripción y cambio de grupo
  - Job de cierre de período

Contacto/Autores
----------------
- Implementado por: equipo CLE/saacle (branch `inscriptions`).
- Repositorio: `cle-saacle` (owner: YochiMC)

Última actualización: 2026-05-04
