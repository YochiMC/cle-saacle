import { useState, useMemo, useEffect, useCallback } from 'react';

/**
 * useTablePagination - Hook especializado en la lógica de paginación.
 * 
 * @param {number} totalItems - Cantidad total de elementos.
 * @param {number} elementosPorPagina - Elementos a mostrar por página.
 * @returns {Object}
 */
export const useTablePagination = (totalItems, elementosPorPagina = 12) => {
    const [paginaActual, setPaginaActual] = useState(1);

    // Calculamos el total de páginas de forma reactiva
    const totalPaginas = useMemo(() => 
        Math.max(1, Math.ceil(totalItems / elementosPorPagina)),
    [totalItems, elementosPorPagina]);

    // Guardia de límites: Solo ajustamos la página si queda fuera del nuevo rango (ej: tras borrar registros)
    useEffect(() => {
        if (paginaActual > totalPaginas) {
            setPaginaActual(totalPaginas);
        }
    }, [totalPaginas, paginaActual]);

    /**
     * Función pura (en el contexto del hook) para recortar los items.
     * @param {Array} items - El array completo de items filtrados.
     */
    const getPaginatedItems = useCallback((items) => {
        const startIndex = (paginaActual - 1) * elementosPorPagina;
        return items.slice(startIndex, startIndex + elementosPorPagina);
    }, [paginaActual, elementosPorPagina]);

    return {
        paginaActual,
        setPaginaActual,
        totalPaginas,
        getPaginatedItems
    };
};
