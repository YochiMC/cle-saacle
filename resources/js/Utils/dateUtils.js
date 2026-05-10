/**
 * Formatea una fecha ISO (YYYY-MM-DD) al formato legible en es-MX.
 * Ej: "2026-04-08" → "08 abr 2026".
 *
 * @param {string} dateString - Fecha en formato ISO.
 * @returns {string} Fecha formateada o cadena vacía si no hay valor.
 */
export const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

/**
 * Construye un rango de fechas legible.
 * 
 * @param {string} start - Fecha inicio ISO.
 * @param {string} end - Fecha fin ISO.
 * @returns {string} Rango formateado.
 */
export const formatDateRange = (start, end) => {
    const startDisplay = formatDate(start);
    const endDisplay = formatDate(end);

    if (start && end) {
        return start === end ? startDisplay : `Del ${startDisplay} al ${endDisplay}`;
    }

    return startDisplay || endDisplay || "Por definir";
};
