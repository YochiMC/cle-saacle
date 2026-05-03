import { METADATA_KEYS } from "../Constants/groupConstants";

/**
 * Utilidades de lógica de negocio pura para el módulo de Grupos.
 * No contiene dependencias de React para facilitar su testeo.
 */

/**
 * Determina las llaves de las unidades evaluables según el tipo de grupo.
 */
export const getUnitKeys = (grupo) => {
    // Regla estricta para Programa Egresados
    if (grupo?.type === 'Programa Egresados') {
        return ['hizo_certificacion', 'a1', 'a2', 'b1'];
    }

    // Regla dinámica basada en unidades configuradas
    const unitsCount = grupo?.evaluable_units || 0;
    if (unitsCount > 0) {
        return Array.from({ length: unitsCount }, (_, i) => `unit_${i + 1}`);
    }

    return [];
};

/**
 * Aísla el objeto units_breakdown filtrando las llaves de metadatos.
 */
export const buildUnitsBreakdown = (row) =>
    Object.fromEntries(
        Object.entries(row).filter(([key]) => !METADATA_KEYS.has(key))
    );

/**
 * Calcula el promedio ponderado de las unidades.
 * @param {Object} unitsBreakdown
 * @returns {number|string} Promedio redondeado o 'NA' si reprueba alguna unidad.
 */
export const calculateAverage = (unitsBreakdown) => {
    const numericValues = Object.entries(unitsBreakdown)
        .filter(([key, v]) => 
            key !== 'hizo_certificacion' && 
            (typeof v === 'number' || (typeof v === 'string' && v !== '' && !isNaN(Number(v))))
        )
        .map(([, v]) => Number(v));

    if (numericValues.length === 0) return 0;

    // Regla de Negocio: si alguna calificación es menor a 70, el promedio es 'NA'
    const isFailing = numericValues.some(val => val < 70);
    if (isFailing) return 'NA';

    return Math.round(numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length);
};

/**
 * Normaliza una fila de calificación cruda del backend para el ResourceDashboard.
 */
export const normalizeQualificationRow = (row, grupo) => {
    const rawBreakdown =
        row?.units_breakdown && typeof row.units_breakdown === "object" && !Array.isArray(row.units_breakdown)
            ? row.units_breakdown
            : {};
            
    const expectedKeys = getUnitKeys(grupo);
    const unitsBreakdownFlat = {};
    
    expectedKeys.forEach((key) => {
        unitsBreakdownFlat[key] = rawBreakdown[key] ?? (key === "hizo_certificacion" ? 0 : 0);
    });

    const { units_breakdown: _ignored, ...rest } = row;
    const { final_average, is_approved: _unused1, is_left, ...baseFields } = rest;

    return {
        ...baseFields,
        is_left: is_left ?? false,
        ...unitsBreakdownFlat,
        final_average: final_average !== undefined ? final_average : 0,
    };
};

/**
 * Serializa los datos locales para el envío atómico al servidor.
 */
export const serializeQualification = (row) => ({
    qualification_id: row.qualification_id,
    units_breakdown: buildUnitsBreakdown(row),
    final_average: row.final_average,
    is_left: !!row.is_left,
});
