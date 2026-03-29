import { useState, useMemo, useCallback, useEffect } from "react";
import { router } from "@inertiajs/react";

const isRouteFunctionAvailable = typeof route === "function";

const isEmptyFilterValue = (value) => {
    if (value === null || value === undefined || value === "") return true;
    if (Array.isArray(value)) return value.length === 0;
    return false;
};

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
    const [busqueda, setBusqueda] = useState("");
    const [filtros, setFiltros] = useState(initialFilters);
    const [paginaActual, setPaginaActual] = useState(1);
    const [seleccionados, setSeleccionados] = useState([]);

    const [modales, setModales] = useState(initialModals);
    const [itemEditando, setItemEditando] = useState(null);
    const [itemViendo, setItemViendo] = useState(null);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtros, items]);

    const itemsFiltrados = useMemo(() => {
        if (typeof filterCallback !== "function") return items;

        return filterCallback({
            items,
            busqueda,
            filtros,
        });
    }, [items, busqueda, filtros, filterCallback]);

    const totalPaginas = useMemo(
        () =>
            Math.max(1, Math.ceil(itemsFiltrados.length / elementosPorPagina)),
        [itemsFiltrados.length, elementosPorPagina],
    );

    const itemsPaginados = useMemo(
        () =>
            itemsFiltrados.slice(
                (paginaActual - 1) * elementosPorPagina,
                paginaActual * elementosPorPagina,
            ),
        [itemsFiltrados, paginaActual, elementosPorPagina],
    );

    const hayFiltros = useMemo(() => {
        const filtrosActivos = Object.values(filtros).some(
            (value) => !isEmptyFilterValue(value),
        );
        return busqueda.trim() !== "" || filtrosActivos;
    }, [busqueda, filtros]);

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

    const handleOpenModal = useCallback((modalKey, payload = null) => {
        setModales((prev) => ({
            ...prev,
            [modalKey]: true,
        }));

        if (modalKey === "formulario") setItemEditando(payload);
        if (modalKey === "detalles") setItemViendo(payload);
    }, []);

    const handleCloseModal = useCallback((modalKey) => {
        setModales((prev) => ({
            ...prev,
            [modalKey]: false,
        }));

        if (modalKey === "formulario") setItemEditando(null);
        if (modalKey === "detalles") setItemViendo(null);
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
