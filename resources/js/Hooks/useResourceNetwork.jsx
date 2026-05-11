import { useCallback } from "react";
import { router } from "@inertiajs/react";

const isRouteFunctionAvailable = typeof route === "function";

/**
 * Utility: Resuelve el target de la ruta basado en la configuración.
 */
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
        if (routeConfig.url) return routeConfig.url;
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

/**
 * Utility: Ejecuta una petición con Inertia.
 */
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
 * useResourceNetwork - Hook especializado en la comunicación con el servidor (Inertia).
 * 
 * @param {Object} routes - Mapa de rutas configuradas.
 * @param {Array} seleccionados - Lista de IDs seleccionados para acciones masivas.
 * @param {Function} handleClearSelection - Función para limpiar la selección tras éxito.
 * @returns {Object}
 */
export const useResourceNetwork = (routes, seleccionados = [], handleClearSelection) => {
    
    const handleBulkStatus = useCallback(
        (nuevoEstado, extraData = {}, options = {}) => {
            if (!nuevoEstado || seleccionados.length === 0 || !routes.bulkStatus) return;

            requestWithInertia({
                routeConfig: routes.bulkStatus,
                method: routes.bulkStatusMethod ?? "post",
                data: {
                    ids: seleccionados,
                    new_status: nuevoEstado,
                    ...extraData,
                },
                options: {
                    onSuccess: () => handleClearSelection?.(),
                    ...options,
                },
            });
        },
        [seleccionados, routes.bulkStatus, routes.bulkStatusMethod, handleClearSelection]
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
                    onSuccess: () => handleClearSelection?.(),
                    ...options,
                },
            });
        },
        [seleccionados, routes.bulkDelete, routes.bulkDeleteMethod, handleClearSelection]
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
        [routes.delete, routes.deleteMethod]
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
        [routes]
    );

    return {
        handleBulkStatus,
        handleBulkDelete,
        handleDelete,
        handleAction,
    };
};
