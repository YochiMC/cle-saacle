# Plan de trabajo - Migración de Kardex desde Excel a la base de datos

## Objetivo

Implementar una nueva migración de datos normalizados desde Excel hacia la base de datos de producción para el módulo de Kardex, siguiendo un patrón similar al trabajo realizado en esta rama para la migración de alumnos.

La nueva tabla `kardex` deberá registrar, como mínimo:

- `student_id` o la relación equivalente al alumno, si aplica en el diseño final.
- `level_id` como llave foránea hacia la tabla existente `levels`.
- `period` como cadena de texto.
- `final_grade` como la calificación/promedio final.
- `created_at` y `updated_at`.

> [!NOTE]
> Antes de implementar, conviene confirmar si el Kardex se guardará por alumno y por periodo, o si el diseño incluye una fila por materia/registro histórico. Este plan asume una tabla orientada a periodos con una calificación final consolidada.

## Alcance

Este trabajo cubre tres piezas principales:

1. La migración de base de datos para crear la tabla `kardex`.
2. El modelo Eloquent correspondiente.
3. El comando de importación para cargar Kardex desde un Excel normalizado.

## Supuestos de entrada

Se asume que el Excel ya vendrá normalizado, con encabezados consistentes y una fila por registro de Kardex. El archivo deberá contener al menos las columnas:

- `level_id`
- `period`
- `final_grade`

Si el diseño final requiere alumno, entonces también deberá incluirse:

- `num_control` o `student_id`

## Fases propuestas

### Fase 1: Definición de contrato de datos

- Definir el formato exacto del Excel de entrada.
- Confirmar nombres de encabezados, tipos de dato y columnas obligatorias.
- Definir si el Kardex se asocia a `student_id`, `num_control` o ambos.
- Definir reglas de validación para periodo y calificación.

### Fase 2: Base de datos

- Crear la migración de `kardex`.
- Agregar la llave foránea a `levels`.
- Definir índices y restricciones necesarias.
- Confirmar si se requiere unicidad por alumno + nivel + periodo.

### Fase 3: Modelo

- Crear `app/Models/Kardex.php`.
- Definir `$fillable` y casts necesarios.
- Agregar relaciones con `Level` y, si aplica, con `Student`.

### Fase 4: Importación

- Crear `app/Imports/KardexImport.php`.
- Leer el archivo con encabezados.
- Normalizar valores.
- Validar existencia de `level_id`.
- Validar que `final_grade` tenga formato numérico válido.
- Evitar duplicados si el contrato lo requiere.

### Fase 5: Comando de consola

- Crear un comando tipo `kardex:import`.
- Permitir lectura desde ruta local o desde disco de Storage.
- Reportar filas procesadas, importadas, omitidas y con errores.

### Fase 6: Pruebas

- Agregar pruebas de importación con archivo válido.
- Agregar pruebas con filas inválidas.
- Agregar pruebas de duplicados si aplica.
- Verificar que el comando no falle ante filas vacías.

### Fase 7: Validación en entorno controlado

- Probar primero con un archivo pequeño de staging.
- Revisar registros creados en la base de datos.
- Confirmar consistencia de conteos y relaciones.
- Probar un archivo de producción anonimizado antes de ejecutar la importación real.

## Reglas recomendadas para la importación

- `level_id` debe existir en la tabla `levels`.
- `period` debe ser una cadena no vacía.
- `final_grade` debe ser numérico y estar dentro del rango esperado por negocio.
- Las filas vacías deben omitirse sin fallar.
- Si existe una llave natural de deduplicación, debe validarse antes de crear el registro.

## Criterios de aceptación

La implementación se considerará lista cuando:

- El modelo `Kardex` exista y esté relacionado correctamente.
- La migración cree la tabla sin errores.
- El comando de importación procese un Excel normalizado sin intervención manual.
- El import reporte correctamente errores de validación y duplicados.
- El flujo haya sido probado con datos de muestra y con al menos un archivo real de prueba.

## Riesgos a vigilar

- Ambigüedad en el contrato de Kardex si no se define el nivel de granularidad.
- Problemas de integridad si `level_id` no existe en todos los registros del Excel.
- Diferencias entre el promedio final esperado y el valor que viene en el archivo.
- Carga masiva de archivos grandes sin lectura por bloques.

## Propuesta de siguiente paso

Antes de codificar, validar el contrato final del Excel y el modelo de Kardex con el equipo funcional. Con eso se puede generar la migración, el modelo y el import con mínima retrabajo.
