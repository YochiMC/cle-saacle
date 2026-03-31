import { useState, useMemo, useCallback, useEffect } from "react";

/**
 * Hook genérico para la gestión de estados base de catálogos (Data Grids).
 * Aplica el Principio de Responsabilidad Única (SRP) manejando exclusivamente:
 * Búsqueda, Filtros adicionales, Paginación y Selección Múltiple.
 *
 * @param {Object} params
 * @param {Array} params.initialData - Lista completa de elementos a inicializar.
 * @param {number} [params.itemsPerPage=12] - Elementos por página.
 * @param {Function} params.filterFunction - Función que ejecuta el filtrado: ({ items, busqueda, filtrosAdicionales }) => items
 * @param {Object} [params.initialFilters={}] - Estado inicial para filtros adicionales.
 */
export const useCatalogData = ({
    initialData = [],
    itemsPerPage = 12,
    filterFunction,
    initialFilters = {},
}) => {
    // 1. Estados de Datos
    const [busqueda, setBusqueda] = useState("");
    const [filtrosAdicionales, setFiltrosAdicionales] = useState(initialFilters);
    const [paginaActual, setPaginaActual] = useState(1);
    const [seleccionados, setSeleccionados] = useState([]);

    // 2. Efecto para reiniciar paginación cuando cambian los filtros o búsqueda
    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtrosAdicionales, initialData]);

    // 3. Memorizaciones de Procesamiento
    const itemsFiltrados = useMemo(() => {
        if (!filterFunction || typeof filterFunction !== "function") return initialData;
        return filterFunction({
            items: initialData,
            busqueda,
            filtros: filtrosAdicionales, // Para retrocompatibilidad visual semántica con groupFilters.js
            filtrosAdicionales, 
        });
    }, [initialData, busqueda, filtrosAdicionales, filterFunction]);

    const itemsPaginados = useMemo(() => {
        const start = (paginaActual - 1) * itemsPerPage;
        const end = paginaActual * itemsPerPage;
        return itemsFiltrados.slice(start, end);
    }, [itemsFiltrados, paginaActual, itemsPerPage]);

    const totalPaginas = useMemo(
        () => Math.max(1, Math.ceil(itemsFiltrados.length / itemsPerPage)),
        [itemsFiltrados.length, itemsPerPage]
    );

    // Helpers
    const isEmptyFilterValue = (value) => {
        if (value === null || value === undefined || value === "") return true;
        if (Array.isArray(value)) return value.length === 0;
        return false;
    };

    const hayFiltros = useMemo(() => {
        const filtrosActivos = Object.values(filtrosAdicionales).some(
            (value) => !isEmptyFilterValue(value)
        );
        return busqueda.trim() !== "" || filtrosActivos;
    }, [busqueda, filtrosAdicionales]);

    // 4. Callbacks de Acción (Setters estables)
    const toggleSelect = useCallback((id) => {
        setSeleccionados((prev) =>
            prev.includes(id)
                ? prev.filter((selectedId) => selectedId !== id)
                : [...prev, id]
        );
    }, []);

    const clearSelection = useCallback(() => {
        setSeleccionados([]);
    }, []);

    const setFiltroAdicional = useCallback((key, value) => {
        setFiltrosAdicionales((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    return {
        // Estados modificables
        busqueda,
        setBusqueda,
        filtrosAdicionales,
        setFiltrosAdicionales,
        setFiltroAdicional,
        paginaActual,
        setPaginaActual,
        seleccionados,
        
        // Acciones expuestas
        toggleSelect,
        clearSelection,

        // Datos derivados listos para consumir
        itemsFiltrados,
        itemsPaginados,
        totalPaginas,
        hayFiltros,
    };
};
