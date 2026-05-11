import { useMemo, useEffect } from "react";
import { useTablePagination } from "@/Hooks/useTablePagination";
import { useTableFilters } from "@/Hooks/useTableFilters";
import { useTableModals } from "@/Hooks/useTableModals";
import { useTableSelection } from "@/Hooks/useTableSelection";
import { useResourceNetwork } from "@/Hooks/useResourceNetwork";

/**
 * Hook genérico para administración de recursos con Inertia.
 *
 * @param {Object} params
 * @param {Array} [params.items=[]] Lista de elementos del recurso.
 * @param {number} [params.elementosPorPagina=12] Tamaño de página.
 * @param {Function} params.filterCallback Función de filtrado: ({ items, busqueda, filtros }) => itemsFiltrados.
 * @param {Object} [params.routes={}] Rutas dinámicas por acción.
 * @param {Object} [params.initialFilters={}] Estado inicial de filtros.
 * @param {Object} [params.initialModals={}] Estado inicial de modales.
 * @returns {Object}
 */
export const useResourceManagement = ({
    items = [],
    elementosPorPagina = 12,
    filterCallback,
    routes = {},
    initialFilters = {},
    initialModals = {
        formulario: false,
        detalles: false,
    },
}) => {
    const {
        busqueda,
        setBusqueda,
        filtros,
        setFiltros,
        handleSetFiltro,
        handleSetFiltros,
        handleResetFiltros,
        hayFiltros,
    } = useTableFilters(initialFilters);

    const modalBehaviors = useMemo(() => ({
        formulario: 'edit',
        detalles: 'view'
    }), []);

    const {
        modales,
        setModales,
        itemEditando,
        setItemEditando,
        itemViendo,
        setItemViendo,
        handleOpenModal,
        handleCloseModal,
    } = useTableModals(initialModals, modalBehaviors);

    const {
        seleccionados,
        setSeleccionados,
        handleToggleSelect,
        handleClearSelection,
    } = useTableSelection();

    const itemsFiltrados = useMemo(() => {
        if (typeof filterCallback !== "function") return items;

        return filterCallback({
            items,
            busqueda,
            filtros,
        });
    }, [items, busqueda, filtros, filterCallback]);

    // Delegamos la lógica de paginación al hook especializado
    const {
        paginaActual,
        setPaginaActual,
        totalPaginas,
        getPaginatedItems
    } = useTablePagination(itemsFiltrados.length, elementosPorPagina);

    // Reset de página al filtrar o buscar para asegurar que el usuario vea resultados desde el inicio
    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtros, setPaginaActual]);

    const itemsPaginados = useMemo(
        () => getPaginatedItems(itemsFiltrados),
        [getPaginatedItems, itemsFiltrados]
    );

    // Delegamos la capa de red al hook especializado
    const {
        handleBulkStatus,
        handleBulkDelete,
        handleDelete,
        handleAction
    } = useResourceNetwork(routes, seleccionados, handleClearSelection);

    return {
        busqueda,
        setBusqueda,
        filtros,
        setFiltros,
        paginaActual,
        setPaginaActual,
        seleccionados,
        setSeleccionados,
        modales,
        setModales,
        itemEditando,
        setItemEditando,
        itemViendo,
        setItemViendo,

        itemsFiltrados,
        itemsPaginados,
        totalPaginas,
        hayFiltros,

        handleSetFiltro,
        handleSetFiltros,
        handleResetFiltros,
        handleToggleSelect,
        handleClearSelection,
        handleOpenModal,
        handleCloseModal,

        handleBulkStatus,
        handleBulkDelete,
        handleDelete,
        handleAction,
    };
};
