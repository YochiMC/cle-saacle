/**
 * Constantes para el módulo de Gestión de Grupos.
 */

/**
 * Teclas de metadatos que no deben ser tratadas como unidades evaluables
 * en los cálculos matemáticos de promedios.
 */
export const METADATA_KEYS = new Set([
    "id",
    "full_name",
    "matricula",
    "gender",
    "semester",
    "qualification_id",
    "final_average",
    "is_approved",
    "is_left",
]);

/**
 * Opciones de visualización por defecto para el ResourceDashboard.
 */
export const VIEW_OPTIONS = [
    { value: "alumnos", label: "Alumnos Inscritos" }
];

/**
 * Configuración de rangos para el esquema de unidades.
 */
export const EVALUABLE_UNITS_RANGE = [1, 2, 3, 4, 5, 6, 7, 8];
