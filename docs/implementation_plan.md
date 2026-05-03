# Fase 8 — Conexión Backend del Kardex y Acceso desde el Perfil

Este plan detalla el mapeo e integración de la base de datos real con el Kardex digital que ha sido maquetado, así como el flujo de acceso mediante la vista de Perfil.

## User Review Required

> [!IMPORTANT]
> Revisa la lógica propuesta para combinar registros (Grupos y Exámenes). Al tener dos fuentes de calificaciones (la tabla `qualifications` para cursos y `exam_student` para acreditaciones), unificaremos ambas en una sola colección serializada para el frontend.

## Proposed Changes

### 1. Extensión del Perfil en Backend (Controlador)
**Archivo:** `app/Http/Controllers/ProfileController.php`

- Añadiremos el método `kardex(User $user)` en este controlador, logrando que el acceso pertenezca al dominio del usuario.
- **Flujo Lógico:**
  1. Validar que `$user->student` exista; de lo contrario abortar (404 o redirect con error).
  2. Construir `$studentInfo` extrayendo las relaciones: `$user->student->full_name`, `$user->student->num_control`, `$user->student->degree->name` (o sigla si aplica).
  3. Recuperar acreditaciones de Grupos Ordinarios: 
     Consultar en `Qualification` con su relación `group` (para periodo y nivel Mcer/TECNM) filtrando por el estudiante e iterarlo.
  4. Recuperar acreditaciones por Exámenes (Globales/Ubicación): 
     Iterar sobre `$user->student->exams` (la relación Pivote) para recuperar nombre/tipo del examen, periodo de aplicación, y calificación pivote.
  5. Unificar ambos mapeos en la colección `$kardexData` reestructurando las keys a: `period` (Periodo académico), `subject` (Materia/Nivel), `grade` (Calificación en número / NA) y `status` ('Acreditado' o 'No Acreditado' evaluando si la calificación es >= 70).
  6. Ordenar la colección cronológicamente (opcional, por ID de periodo).
  7. Retornar a vista: `return Inertia::render('Academic/Kardex', compact('studentInfo', 'kardexData'));`.

### 2. Enrutamiento Protegido
**Archivo:** `routes/web.php`

- Añadir dentro del middleware protegido `auth`:
  ```php
  Route::get('/profiles/{user}/kardex', [ProfileController::class, 'kardex'])->name('profiles.kardex');
  ```

### 3. Conexión del Botón en UI
**Archivo:** `resources/js/Pages/Profile/Users/Edit.jsx`

- Requeriremos `Link` de `inertiajs/react`.
- Aprovechando el contenedor secundario (probablemente arriba del formulario de eliminar cuenta o junto a la tarjeta de información), inyectaremos condicionalmente el botón de acceso.
  ```jsx
  {user.data.student && (
      <div className="p-4 bg-white border shadow border-blueTec/20 sm:rounded-lg sm:p-8 mb-6">
          <SectionTitle title="Historial Académico" description="Consulta el Kardex de calificaciones del estudiante." />
          <Link href={route('profiles.kardex', user.data.id)} className="...">
              Ver Kardex Académico
          </Link>
      </div>
  )}
  ```

### 4. Limpieza de Mocks
**Archivo:** `resources/js/Pages/Academic/Kardex.jsx`

- Reestructuraremos el destructuring inicial: `export default function Kardex({ auth, studentInfo, kardexData }) {`
- Eliminaremos los objetos estáticos/quemados internos (el objeto manual de "JOSÉ EDUARDO MARTÍNEZ LÓPEZ").
- Comprobaremos si ambos arrays tienen información para alimentar adecuadamente a los Dumb Components hijos `<StudentHeader>` y `<KardexTable>`.

***

## Open Questions

> [!TIP]
> ¿Tienes preferencia en la construcción del campo `subject` (Materia) para los Exámenes? En Grupos suele ser el `level_tecnm` (ej. "Inglés 1"), en Exámenes puede formarse como: `"Examen de " . $exam->exam_type->value` o prefieres el `$exam->name` literal?

## Verification Plan
1. Ejecutar las herramientas abstractas para modificar PHP y JS.
2. Comprobar que en el navegador, al editar un alumno con historial en BD, el botón esté habilitado y rutee `/profiles/{id}/kardex`.
3. Validar consistencia al correr `npm run build`.
