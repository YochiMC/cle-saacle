import { useState, useCallback, useMemo } from "react";

/**
 * Helper interno para determinar si un valor de filtro está vacío.
 */
const isEmptyFilterValue = (value) => {
    if (value === null || value === undefined || value === "") return true;
    if (Array.isArray(value)) return value.length === 0;
    return false;
};

/**
 * useTableFilters - Hook especializado en la gestión de estados de búsqueda y filtrado.
 * 
 * @param {Object} initialFilters - Estado inicial de los filtros.
 * @returns {Object}
 */
export const useTableFilters = (initialFilters = {}) => {
    const [busqueda, setBusqueda] = useState("");
    const [filtros, setFiltros] = useState(initialFilters);

    const handleSetFiltro = useCallback((key, value) => {
        setFiltros((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    const handleSetFiltros = useCallback((newFilters) => {
        setFiltros((prev) => ({
            ...prev,
            ...newFilters,
        }));
    }, []);

    const handleResetFiltros = useCallback(() => {
        setBusqueda("");
        setFiltros(initialFilters);
    }, [initialFilters]);

    const hayFiltros = useMemo(() => {
        const filtrosActivos = Object.values(filtros).some(
            (value) => !isEmptyFilterValue(value),
        );
        return busqueda.trim() !== "" || filtrosActivos;
    }, [busqueda, filtros]);

    return {
        busqueda,
        setBusqueda,
        filtros,
        setFiltros,
        handleSetFiltro,
        handleSetFiltros,
        handleResetFiltros,
        hayFiltros,
    };
};
