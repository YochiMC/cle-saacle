/**
 * @file tableColumns.js
 * Configuraciones centralizadas para visibilidad y oculamiento de columnas
 * en tablas DataTable a través del ecosistema.
 * 
 * PRINCIPIO: Las columnas técnicas (IDs, timestamps) están OCULTAS por defecto
 * pero conservadas en el estado de la tabla para acciones en lote (bulk operations).
 * 
 * FORMATO: { [columnId]: false }
 *   - false = oculta por defecto (pero visible en menú "Columnas")
 *   - true = visible por defecto
 *   - omitida = respeta el estado global de la tabla
 */

// ── Columnas Técnicas que SIEMPRE se ocultan en todas las tablas
export const GLOBAL_HIDDEN_TECHNICAL_COLUMNS = {
    id: false,
    user_id: false,
    student_id: false,
    teacher_id: false,
    group_id: false,
    exam_id: false,
    exam_student_id: false,
    created_at: false,
    updated_at: false,
    deleted_at: false,
    created_date: false,
    updated_date: false,
};

// ── Configuración específica para vistas de Usuarios (alumnos + maestros)
export const USERS_HIDDEN_COLUMNS = {
    ...GLOBAL_HIDDEN_TECHNICAL_COLUMNS,
    type: false,
    status_label: false,
    birthdate: false,
};

// ── Configuración específica para vistas de Exámenes
export const EXAMS_HIDDEN_COLUMNS = {
    ...GLOBAL_HIDDEN_TECHNICAL_COLUMNS,
    exam_type_label: false,
    mode_label: false,
};

// ── Configuración específica para vistas de Grupos
export const GROUPS_HIDDEN_COLUMNS = {
    ...GLOBAL_HIDDEN_TECHNICAL_COLUMNS,
    level_id: false,
    teacher_id: false,
    mode_label: false,
    type_label: false,
};

// ── Configuración específica para tablas de Calificaciones (Exams > Grades)
export const GRADES_HIDDEN_COLUMNS = {
    ...GLOBAL_HIDDEN_TECHNICAL_COLUMNS,
    exam_student_id: false,
};

// ── Configuración específica para tablas de Inscripciones
export const ENROLLMENTS_HIDDEN_COLUMNS = {
    ...GLOBAL_HIDDEN_TECHNICAL_COLUMNS,
    enrollment_id: false,
    group_student_id: false,
};

export default {
    GLOBAL_HIDDEN_TECHNICAL_COLUMNS,
    USERS_HIDDEN_COLUMNS,
    EXAMS_HIDDEN_COLUMNS,
    GROUPS_HIDDEN_COLUMNS,
    GRADES_HIDDEN_COLUMNS,
    ENROLLMENTS_HIDDEN_COLUMNS,
};
