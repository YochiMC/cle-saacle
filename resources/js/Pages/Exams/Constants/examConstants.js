/**
 * Constantes para el módulo de Gestión de Exámenes.
 */

export const METADATA_KEYS = new Set([
    "id",
    "full_name",
    "matricula",
    "gender",
    "semester",
    "exam_student_id",
    "final_average",
    "qualification_id",
]);

export const MCER_SCALE = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const MCER_WEIGHTS = {
    "A1": 1,
    "A2": 2,
    "B1": 3,
    "B2": 4,
    "C1": 5,
    "C2": 6,
};

export const VIEW_OPTIONS = [
    { value: "alumnos", label: "Alumnos Inscritos" }
];

/**
 * Tipos de examen que tienen lógica o visualización restringida.
 */
export const RESTRICTED_EXAM_TYPES = [
    "4 habilidades",
    "Convalidación",
    "Ubicación",
    "Planes anteriores"
];
