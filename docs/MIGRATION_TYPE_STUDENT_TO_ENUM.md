# Migración de TypeStudent a Enum

## Resumen

Se ha migrado la tabla `type_students` de una tabla de base de datos a un **Enum de PHP** (`App\Enums\TypeStudent`), siguiendo las mejores prácticas de arquitectura del sistema.

## Cambios Principales

### 1. Nuevo Enum: `TypeStudent`

**Ubicación**: `app/Enums/TypeStudent.php`

```php
enum TypeStudent: string
{
    case VIGENTE = 'vigente';      // Estudiante activo/vigente
    case EGRESADO = 'egresado';    // Estudiante que completó el programa
    
    public function label(): string { ... }
    public static function getOptions(): array { ... }
}
```

**Ventajas**:
- **Type-safe**: El compilador valida los valores en tiempo de compilación
- **Autocompletar**: IDEs ofrecen sugerencias automáticas
- **Menor acoplamiento**: No hay dependencia de base de datos para catálogos estáticos
- **Rendimiento**: Sin queries a base de datos para obtener opciones

### 2. Cambios en la Base de Datos

**Nueva Migración**: `2026_02_19_191750_migrate_type_students_to_enum.php`

```
Antes:
students.type_student_id → type_students.id (foreign key)

Después:
students.type_student → ENUM string ('vigente', 'egresado')
```

**Proceso de migración**:
1. Agregada columna `type_student` como string nullable
2. Datos migrados desde la tabla `type_students`
3. Columna hecha NOT NULL con valor por defecto
4. Eliminada la FK y columna `type_student_id`

### 3. Cambios en Modelos

**Modelo Student** (`app/Models/Student.php`):
```php
// Antes
protected $fillable = [..., 'type_student_id', ...];
public function typeStudent(): BelongsTo { ... }

// Después
protected $fillable = [..., 'type_student', ...];
protected $casts = ['type_student' => TypeStudent::class];
// Relación removida (ya no es necesaria)
```

### 4. Cambios en Validaciones

**StoreStudentRequest** y **UpdateStudentRequest**:
```php
// Antes
'type_student_id' => 'required|exists:type_students,id'

// Después
'type_student' => ['required', new Enum(TypeStudent::class)]
```

**StudentsImport.php**:
```php
// Antes
'*.type_student_id' => ['required', 'exists:type_students,id']

// Después
'*.type_student' => ['required', new Enum(TypeStudent::class)]
```

### 5. Cambios en Resources

**StudentResource** (`app/Http/Resources/StudentResource.php`):

Ahora expone tanto el valor técnico como la etiqueta legible:
```php
return [
    'type_student'       => $rawTypeStudent,        // 'vigente' o 'egresado'
    'type_student_label' => $typeStudentEnum?->label(), // 'Vigente' o 'Egresado'
    ...
];
```

### 6. Cambios en Seeders

**DatabaseSeeder.php**:
- Removida la tabla `type_students` de la lista de truncate
- Removido `TypeStudentSeeder::class` de la lista de seeders

**TypeStudentSeeder.php**:
- Desactivado con documentación clara (no hay datos que sembrar)

### 7. Cambios en Factories

**StudentFactory.php**:
```php
// Antes
'type_student_id' => TypeStudent::inRandomOrder()->value('id') ?? TypeStudent::factory()

// Después
'type_student' => $this->faker->randomElement(TypeStudent::cases())->value
```

### 8. Cambios en Vistas/Controllers

**AdminViewsController.php**:
```php
// Antes
'typeStudents' => TypeStudent::all()

// Después
'typeStudents' => TypeStudent::getOptions()
```

**web.php**:
- Removido import de `TypeStudentController`
- Removidas las rutas CRUD para `type-students`
- Actualizado dashboard para usar `TypeStudent::getOptions()`

### 9. Cambios en Actions

**GetTypeStudentConfigAction.php**:
- Actualizado para servir datos del enum
- Marcado como `isEditable: false` (no editable en catálogos)
- Endpoint seteado a `null` (es un valor estático)

## Archivos Eliminados

Los siguientes archivos ya no son necesarios pero se conservan como referencia histórica:

- `app/Models/TypeStudent.php` - Modelo (ahora es solo un Enum)
- `app/Http/Controllers/TypeStudentController.php` - Controlador CRUD (no necesario)
- `app/Http/Resources/TypeStudentResource.php` - Resource (reemplazado por Enum)
- `app/Http/Requests/StoreTypeStudentRequest.php` - Request (no hay operación de creación)
- `app/Http/Requests/UpdateTypeStudentRequest.php` - Request (no hay operación de actualización)
- `app/Http/Requests/BulkDeleteTypeStudentsRequest.php` - Request (no hay eliminación)
- `database/factories/TypeStudentFactory.php` - Factory (no hay modelo)

## Frontend (JavaScript/Vue)

### Cambios esperados en el frontend

**Antes**:
```javascript
// Opción 1: Del backend como array de objetos
const typeStudents = [
  { id: 1, name: 'Vigente' },
  { id: 2, name: 'Egresado' }
];

// Opción 2: Renderizar como tabla en catálogos
```

**Después**:
```javascript
// Ahora es un array con value/label
const typeStudents = [
  { value: 'vigente', label: 'Vigente' },
  { value: 'egresado', label: 'Egresado' }
];

// En StudentResource
student.type_student = 'vigente'     // valor técnico
student.type_student_label = 'Vigente' // para mostrar en UI
```

### Cambios esperados en forms

**HTML Select**:
```html
<!-- Antes -->
<select name="type_student_id">
  <option value="1">Vigente</option>
  <option value="2">Egresado</option>
</select>

<!-- Después -->
<select name="type_student">
  <option value="vigente">Vigente</option>
  <option value="egresado">Egresado</option>
</select>
```

### APIs REST

**Creación de estudiante** (POST /students):
```json
{
  "type_student_id": 1  // ❌ Antes
}

{
  "type_student": "vigente"  // ✅ Después
}
```

**Respuesta en StudentResource**:
```json
{
  "type_student": "vigente",
  "type_student_label": "Vigente"
}
```

## Pruebas

### Cambios en TestCase

El `TestCase` base ya no siembra `TypeStudentSeeder` porque:
- Los valores del enum no requieren persistencia en BD
- Cualquier test que necesite asignar `type_student` a un estudiante
  usa directamente: `TypeStudent::VIGENTE->value`

### Ejemplo de uso en tests

```php
$student = Student::factory()->create([
    'type_student' => TypeStudent::VIGENTE->value
]);

$this->assertEquals('vigente', $student->type_student);
$this->assertEquals(TypeStudent::VIGENTE, $student->type_student);
```

## Acceso a valores en código

### Antes (como modelo)
```php
$typeStudent = TypeStudent::find(1);
echo $typeStudent->name; // 'Vigente'

TypeStudent::all(); // Array de modelos
```

### Después (como enum)
```php
// Acceder a casos
echo TypeStudent::VIGENTE->value; // 'vigente'
echo TypeStudent::VIGENTE->label(); // 'Vigente'

// Obtener opciones para select
$options = TypeStudent::getOptions();
// [
//   ['value' => 'vigente', 'label' => 'Vigente'],
//   ['value' => 'egresado', 'label' => 'Egresado'],
// ]

// Iterar sobre casos
foreach (TypeStudent::cases() as $case) {
    echo $case->value . ' - ' . $case->label();
}

// Obtener desde string
$enum = TypeStudent::tryFrom('vigente'); // TypeStudent::VIGENTE
```

## Beneficios de esta migración

✅ **Type Safety**: Errores de tipo detectados en compilación  
✅ **Rendimiento**: Sin queries a base de datos para catálogos estáticos  
✅ **Mantenibilidad**: Código más limpio y explícito  
✅ **Escalabilidad**: El patrón Enum es consistente con `StudentStatus`, etc.  
✅ **Autocomplete**: IDEs ofrecen mejor autocompletar  
✅ **Menos código**: No requiere modelo, controlador ni recursos  

## Notas Importantes

1. **Migración no es destructiva**: Si los datos no se migraron correctamente, puede correr `artisan migrate:rollback` para volver atrás.

2. **Enum values son case-sensitive**: 'vigente' ≠ 'Vigente'

3. **Valores en BD son strings**: Aunque sea un enum en PHP, en base de datos son strings ('vigente', 'egresado')

4. **Cambio en catálogos**: El catálogo de tipos de estudiante ahora es **read-only** (no puede editarse desde la UI administrativa)

## Pasos de Despliegue

1. Ejecutar migración: `php artisan migrate`
2. Actualizar frontend con nueva estructura de datos
3. Probar formularios de creación/edición de estudiantes
4. Probar importación de estudiantes (Excel/CSV)
5. Verificar vistas que muestren tipo de estudiante

## Referencias

- Enum `TypeStudent`: [app/Enums/TypeStudent.php](app/Enums/TypeStudent.php)
- Migración: [2026_02_19_191750_migrate_type_students_to_enum.php](database/migrations/2026_02_19_191750_migrate_type_students_to_enum.php)
- Modelo Student: [app/Models/Student.php](app/Models/Student.php)
- StudentResource: [app/Http/Resources/StudentResource.php](app/Http/Resources/StudentResource.php)

---

**Fecha**: 19 de Febrero de 2026  
**Responsable**: Migración de catálogos a Enums
