# Documentación técnica - Rama `copy-migrations`

## Propósito de la rama

Esta rama contiene la primera implementación de una migración real de datos desde Excel hacia la base de datos de producción, enfocada inicialmente en alumnos.

El objetivo fue dejar preparado un flujo de importación reutilizable para cargar información normalizada sin depender de procesos manuales.

## Qué se trabajó

### 1. Importación de estudiantes desde Excel/CSV

Se creó `app/Imports/StudentsImport.php` para leer archivos con encabezados y convertir cada fila en datos listos para persistirse.

La importación hace lo siguiente:

- Normaliza texto, fechas y campos numéricos.
- Valida campos obligatorios y relaciones existentes.
- Omite filas vacías.
- Detecta duplicados por `num_control`.
- Guarda un resumen de filas procesadas, importadas, duplicadas y con errores.

### 2. Comando de consola

Se agregó el comando `students:import` en `routes/console.php`.

Este comando permite importar desde:

- una ruta local a `.xlsx` o `.csv`
- un archivo dentro de un disco de Storage usando `--disk`

Ejemplo:

```bash
php artisan students:import C:/ruta/al/archivo.xlsx
php artisan students:import archivo.xlsx --disk=public
```

### 3. Creación del alumno y su usuario

Se usa `app/Actions/CreateStudentWithUser.php` para crear al usuario y al alumno en una sola transacción.

Esto asegura que el alta sea atómica: si falla una parte, no se deja información parcial.

### 4. Dependencia de Excel

Se agregó `maatwebsite/excel` al proyecto para soportar lectura de Excel y CSV.

## Correcciones aplicadas durante la revisión

Durante la validación real del comando se detectaron y corrigieron estos puntos:

- `users.phone` no admite `null`, así que la creación del usuario fue ajustada para enviar cadena vacía cuando no venga teléfono.
- La detección de duplicados se amplió a `Student::withTrashed()` para evitar choques con registros eliminados lógicamente.
- Se agregaron filas vacías omitidas y lectura por bloques para mejorar estabilidad con archivos grandes.

## Contrato de columnas esperado

El archivo debe incluir estos encabezados:

```text
first_name,last_name,num_control,gender,birthdate,semester,degree_id,type_student_id,level_id,email,password,phone,email_recovery
```

Campos clave:

- `gender` debe ser `M` o `F`.
- `birthdate` puede venir como texto o como fecha de Excel.
- `degree_id`, `type_student_id` y `level_id` deben existir en la base.
- `num_control` es la llave lógica de deduplicación.

## Comportamiento esperado del comando

Al terminar, el comando reporta:

- filas procesadas
- filas importadas
- duplicados omitidos
- errores de validación por fila

## Validación realizada

Se probó el flujo con datos de ejemplo y con errores intencionales.

Resultado observado:

- una fila válida se inserta correctamente
- una segunda ejecución con el mismo `num_control` se omite como duplicado
- una fila inválida se reporta sin romper todo el proceso

## Limitaciones conocidas

- El import actual está pensado solo para alumnos.
- El teléfono se normaliza a cadena vacía si no viene en el archivo, porque la tabla de usuarios lo exige.
- El diseño no incluye todavía Kardex; eso se propone como la siguiente migración.

## Relación con el siguiente trabajo

La rama deja una base útil para implementar la migración de Kardex porque ya existe:

- un patrón de importación con Excel
- un comando de consola reusable
- una estrategia de validación y reporte de errores
- una forma de crear entidades relacionadas dentro de una transacción

Eso permite que la próxima implementación de Kardex siga el mismo enfoque, pero adaptado al nuevo contrato de datos.
