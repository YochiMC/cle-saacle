# Documentación técnica - Rama `migrate-production`

## Propósito

Esta rama amplía el patrón de migración de datos desde Excel iniciado en `copy-migrations`, enfocándose ahora en la migración de calificaciones de legado.

## Implementación de Calificaciones de Legado

### 1. Modelo de Calificaciones Legado

Se utiliza el modelo `app/Models/LegacyQualification.php` con los siguientes campos:

- `student_id`: relación foránea al alumno (se resuelve desde `num_control`).
- `level_id`: relación foránea a la tabla existente `levels`.
- `period`: cadena de texto que representa el período académico.
- `final_grade`: calificación final (numérica entre 0 y 100).

### 2. Importador de Calificaciones

Se creó `app/Imports/QualificationsImport.php` con las siguientes características:

- Lee archivos Excel/CSV con encabezados.
- Normaliza valores de entrada.
- Resuelve `num_control` a `student_id` consultando la tabla `students`.
- Valida que `level_id` exista en la tabla `levels`.
- Valida que `final_grade` sea numérico y esté en el rango válido (0-100).
- Detecta duplicados por clave natural `(student_id, level_id, period)`.
- Procesa en bloques de 500 filas para mejor rendimiento con archivos grandes.

### 3. Comando de Consola

Se agregó el comando `qualifications:import` en `routes/console.php`:

```bash
php artisan qualifications:import C:/ruta/al/archivo.xlsx
php artisan qualifications:import archivo.xlsx --disk=public
```

### 4. Contrato de Columnas para Calificaciones

El archivo debe incluir estos encabezados:

```text
num_control,level_id,period,qualification
```

Donde:
- `num_control`: identificador del alumno (debe existir en tabla `students`).
- `level_id`: ID del nivel académico (debe existir en tabla `levels`).
- `period`: cadena que describe el período (ej: "2025-I", "2024-II").
- `qualification`: calificación final (número entero entre 0 y 100).

### 5. Comportamiento y Validación

Al terminar la importación, el comando reporta:
- Filas procesadas
- Filas importadas exitosamente
- Duplicados omitidos (por combinación student_id + level_id + period)
- Errores de validación por fila

Ejemplo de salida exitosa:

```
Importación de calificaciones finalizada.
Filas procesadas: 2
Filas importadas: 2
Duplicados omitidos (student + level + period): 0
```

Ejemplo con errores de validación:

```
Importación de calificaciones finalizada.
Filas procesadas: 1
Filas importadas: 0
Duplicados omitidos (student + level + period): 0
Filas con errores de validación: 3
Fila 3 | level_id | El campo level_id no existe.
Fila 4 | qualification | El campo qualification no debe ser mayor que 100.
Fila 1 | num_control | No existe alumno con num_control: INVALID999
```

### 6. Validación Realizada

Se probó el flujo con los siguientes escenarios:

- **Importación válida**: 2 registros fueron insertados correctamente en la base de datos.
- **Detección de duplicados**: Una segunda ejecución del mismo archivo omitió ambos registros correctamente.
- **Validación de errores**: Se probó con un archivo que incluía:
  - Un `num_control` inexistente → reportado como error.
  - Un `level_id` inexistente → reportado como error.
  - Una calificación fuera de rango (150) → reportado como error.

### 7. Tabla de Base de Datos

La tabla `legacy_qualifications` fue creada anteriormente con la siguiente estructura:

```sql
CREATE TABLE legacy_qualifications (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT UNSIGNED NOT NULL (FK a students.id),
  level_id BIGINT UNSIGNED NOT NULL (FK a levels.id),
  period VARCHAR(255) NOT NULL,
  final_grade INT NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE(student_id, level_id, period)
);
```

## Patrones Reutilizables

Esta implementación sigue el mismo patrón que la migración de estudiantes:

1. **Importador con normalización y validación** → `app/Imports/QualificationsImport.php`
2. **Resolución de referencias externas** → Lookup de `student_id` desde `num_control`
3. **Detección de duplicados por clave natural** → Evita inserciones repetidas
4. **Procesamiento por bloques** → Mejor rendimiento con archivos grandes
5. **Reporte detallado de resultados** → Filas procesadas, importadas, errores

Este patrón puede replicarse para otras migraciones (ej: Kardex, Pagos, etc).

## Próximas Iteraciones

Con esta rama completada, el siguiente paso natural es implementar la migración de **Kardex actual**, que seguirá el mismo patrón pero se enfocará en el diseño actual del Kardex en lugar de datos históricos.
