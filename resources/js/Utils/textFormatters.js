/**
 * Funciones utilitarias para el formateo de texto en la interfaz.
 * Centraliza la lógica para mantener el Principio de Responsabilidad Única (SRP).
 */

/**
 * Abreviador inteligente de etiquetas para evitar desbordamiento en badges.
 *
 * @param {string} texto - Texto original a abreviar.
 * @returns {string} - Texto abreviado.
 */
export const abreviarEtiqueta = (texto) => {
    if (!texto) return "";

    const textoNormalizado = String(texto).trim();
    const textoMin = textoNormalizado.toLowerCase();

    // 1. Diccionario estricto para casos conocidos
    const diccionario = {
        "programa especial": "PE",
        "convalidación": "CONV",
        "convalidacion": "CONV",
        "planes anteriores": "PLANES ANT",
        "4 habilidades": "4 HAB",
        "ubicación": "UBI",
        "ubicacion": "UBI",
    };

    if (diccionario[textoMin]) {
        return diccionario[textoMin];
    }

    // 2. Si tiene múltiples palabras, genera acrónimo con las iniciales (Ej: "Básico 1" -> "B1")
    const palabras = textoNormalizado.split(/\s+/);
    if (palabras.length > 1) {
        return palabras.map(p => p[0]).join('').toUpperCase();
    }

    // 3. Palabra única mayor a 6 letras, trunca a 4 letras
    if (textoNormalizado.length > 6) {
        return textoNormalizado.substring(0, 4).toUpperCase();
    }

    // 4. Fallback: original en mayúsculas
    return textoNormalizado.toUpperCase();
};

/**
 * Limpia el texto para permitir únicamente letras (incluyendo acentos y ñ), números, espacios y guiones medios.
 *
 * @param {string} texto - El texto original a limpiar.
 * @returns {string} - El texto limpio.
 */
export const limpiarTextoBasico = (texto) => {
    if (!texto) return "";
    // Permitir también los dos puntos ':' además del guión medio
    return String(texto).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s:\-;,]/g, "");
};

/**
 * Limpia el texto para permitir letras, números, espacios y caracteres válidos para URLs.
 *
 * @param {string} texto - El texto original a limpiar.
 * @returns {string} - El texto limpio.
 */
export const limpiarTextoUrl = (texto) => {
    if (!texto) return "";
    return String(texto).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s:\/\.\?=&_\-]/g, "");
};

/**
 * Limpia el texto de calificación para permitir únicamente números enteros.
 *
 * @param {string|number} texto - La calificación original a limpiar.
 * @returns {string} - La calificación limpia.
 */
export const limpiarTextoCalificacion = (texto) => {
    if (texto === null || texto === undefined) return "";
    return String(texto).replace(/[^0-9]/g, "");
};



