/**
 * Resuelve el nombre completo de un docente/usuario desde diversas estructuras posibles.
 * 
 * @param {Object} user - Objeto del usuario o docente.
 * @param {string} [fallback="Docente sin asignar"] - Valor de retorno si no se encuentra nombre.
 * @returns {string} Nombre formateado.
 */
export const formatUserName = (user, fallback = "Docente sin asignar") => {
    if (!user) return fallback;

    // Caso 1: Estructura { name, last_name }
    const nameByFull = [user.name, user.last_name].filter(Boolean).join(" ");
    if (nameByFull) return nameByFull;

    // Caso 2: Estructura { first_name, last_name }
    const nameByFirst = [user.first_name, user.last_name].filter(Boolean).join(" ");
    if (nameByFirst) return nameByFirst;

    // Caso 3: Propiedad directa (ej: teacher_name del recurso)
    return user.teacher_name || user.full_name || user.name || fallback;
};
