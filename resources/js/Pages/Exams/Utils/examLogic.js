import { METADATA_KEYS, MCER_WEIGHTS, RESTRICTED_EXAM_TYPES } from "../Constants/examConstants";

/**
 * Utilidades de lógica de negocio pura (Grading Engine) para el módulo de Exámenes.
 */

/**
 * Normaliza una fila del backend aplanando units_breakdown para la tabla.
 */
export const normalizeQualificationRow = (row) => {
    const unitsBreakdown =
        row?.units_breakdown && typeof row.units_breakdown === "object" && !Array.isArray(row.units_breakdown)
            ? row.units_breakdown
            : {};

    const { units_breakdown, ...rest } = row;

    return {
        ...rest,
        ...unitsBreakdown,
    };
};

/**
 * Extrae las claves dinámicas de calificación de una colección de filas.
 */
export const getUnitKeysFromRows = (rows) => {
    return Array.from(
        new Set(
            rows.flatMap((row) =>
                Object.keys(row).filter((key) => !METADATA_KEYS.has(key)),
            ),
        ),
    );
};

/**
 * Calcula el promedio numérico estándar.
 */
export const calculateAverage = (unitsBreakdown) => {
    const numericValues = Object.entries(unitsBreakdown)
        .filter(([, v]) => typeof v === "number" || (typeof v === "string" && v !== "" && !isNaN(Number(v))))
        .map(([, v]) => Number(v))
        .filter(Number.isFinite);

    if (numericValues.length === 0) return 0;

    return Math.round(numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length);
};

/**
 * Motor de calificación para "4 habilidades" (MCER).
 * Regla: El resultado es el nivel más bajo obtenido en las 4 áreas.
 * Si alguna habilidad < B1 (Peso 3), el resultado es NA.
 */
export const calculateMcerOutcome = (row) => {
    const skills = ["listening", "reading", "writing", "speaking"];
    let lowestWeight = Infinity;
    let allSkillsValid = true;

    for (const skill of skills) {
        const val = row[skill]?.toString().toUpperCase().trim();
        
        if (!val || !(val in MCER_WEIGHTS)) {
            allSkillsValid = false;
            break;
        }
        
        const weight = MCER_WEIGHTS[val];
        if (weight < lowestWeight) lowestWeight = weight;
        
        // Regla académica: Mínimo B1 para acreditar
        if (weight < 3) {
            allSkillsValid = false;
            break;
        }
    }

    if (!allSkillsValid || lowestWeight < 3) return "NA";

    // Retorna el nombre del nivel correspondiente al peso más bajo
    return Object.keys(MCER_WEIGHTS).find(k => MCER_WEIGHTS[k] === lowestWeight) || "NA";
};

/**
 * Determina qué columnas deben ocultarse según el tipo de examen.
 */
export const getRestrictedColumns = (examType) => {
    const restricted = [];
    if (RESTRICTED_EXAM_TYPES.includes(examType)) {
        restricted.push("final_average");
    }
    return restricted;
};

/**
 * Serializa la fila para el contrato del backend.
 */
export const serializeQualification = (row) => {
    // Campos que no van al JSON units_breakdown
    const { 
        id, 
        full_name, 
        matricula, 
        exam_student_id, 
        final_average, 
        qualification_id, 
        gender, 
        semester, 
        ...dynamicUnits 
    } = row;
    
    return {
        student_id: id,
        final_average: final_average || 0,
        units_breakdown: dynamicUnits
    };
};
