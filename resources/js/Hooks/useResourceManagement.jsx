import { useState, useMemo, useCallback, useEffect } from "react";
import { router } from "@inertiajs/react";
import { useTablePagination } from "@/Hooks/useTablePagination";
import { useTableFilters } from "@/Hooks/useTableFilters";
import { useTableModals } from "@/Hooks/useTableModals";

const isRouteFunctionAvailable = typeof route === "function";

const resolveRouteTarget = (routeConfig, routeParams = []) => {
    if (!routeConfig) return null;

    if (typeof routeConfig === "function") {
        return routeConfig(...routeParams);
    }

    if (typeof routeConfig === "string") {
        if (isRouteFunctionAvailable) {
            return route(routeConfig, ...routeParams);
        }

        return routeConfig;
    }

    if (typeof routeConfig === "object") {
        if (typeof routeConfig.resolve === "function") {
            return routeConfig.resolve(...routeParams);
        }

        if (routeConfig.url) {
            return routeConfig.url;
        }

        if (routeConfig.name) {
            const params = routeConfig.params ?? routeParams;

            if (isRouteFunctionAvailable) {
                return route(routeConfig.name, ...params);
            }

            return routeConfig.name;
        }
    }

    return null;
};

const requestWithInertia = ({
    routeConfig,
    method,
    routeParams = [],
    data = {},
    options = {},
}) => {
    const target = resolveRouteTarget(routeConfig, routeParams);
    if (!target) return;

    if (method === "delete") {
        router.delete(target, {
            data,
            ...options,
        });
        return;
    }

    router[method](target, data, options);
};

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

    const [seleccionados, setSeleccionados] = useState([]);

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

    const handleToggleSelect = useCallback((id) => {
        setSeleccionados((prev) =>
            prev.includes(id)
                ? prev.filter((selectedId) => selectedId !== id)
                : [...prev, id],
        );
    }, []);

    const handleClearSelection = useCallback(() => {
        setSeleccionados([]);
    }, []);

    const handleBulkStatus = useCallback(
        (nuevoEstado, extraData = {}, options = {}) => {
            if (
                !nuevoEstado ||
                seleccionados.length === 0 ||
                !routes.bulkStatus
            )
                return;

            requestWithInertia({
                routeConfig: routes.bulkStatus,
                method: routes.bulkStatusMethod ?? "post",
                data: {
                    ids: seleccionados,
                    new_status: nuevoEstado,
                    ...extraData,
                },
                options: {
                    onSuccess: () => handleClearSelection(),
                    ...options,
                },
            });
        },
        [
            seleccionados,
            routes.bulkStatus,
            routes.bulkStatusMethod,
            handleClearSelection,
        ],
    );

    const handleBulkDelete = useCallback(
        (extraData = {}, options = {}) => {
            if (seleccionados.length === 0 || !routes.bulkDelete) return;

            requestWithInertia({
                routeConfig: routes.bulkDelete,
                method: routes.bulkDeleteMethod ?? "delete",
                data: {
                    ids: seleccionados,
                    ...extraData,
                },
                options: {
                    onSuccess: () => handleClearSelection(),
                    ...options,
                },
            });
        },
        [
            seleccionados,
            routes.bulkDelete,
            routes.bulkDeleteMethod,
            handleClearSelection,
        ],
    );

    const handleDelete = useCallback(
        (id, extraData = {}, options = {}) => {
            if (!id || !routes.delete) return;

            requestWithInertia({
                routeConfig: routes.delete,
                method: routes.deleteMethod ?? "delete",
                routeParams: [id],
                data: extraData,
                options,
            });
        },
        [routes.delete, routes.deleteMethod],
    );

    const handleAction = useCallback(
        (actionKey, { routeParams = [], data = {}, options = {} } = {}) => {
            const actionRoute = routes[actionKey];
            if (!actionRoute) return;

            const method = routes[`${actionKey}Method`] ?? "post";

            requestWithInertia({
                routeConfig: actionRoute,
                method,
                routeParams,
                data,
                options,
            });
        },
        [routes],
    );

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
