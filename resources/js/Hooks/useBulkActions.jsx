import { useState, useCallback } from "react";
import { router } from "@inertiajs/react";

/**
 * useBulkActions
 *
 * Encapsula todo el estado y los manejadores de las acciones masivas:
 * selección de filas, copiado WYSIWYG a portapapeles y eliminación masiva.
 *
 * @param {string|Object} deleteRoute - Ruta de eliminación masiva (string) o mapa por vista.
 * @param {string} vistaActual  - Clave de la vista activa (se envía al servidor junto con los ids).
 * @param {"post"|"delete"|"put"|"patch"} bulkDeleteMethod - Método HTTP para la operación masiva.
 * @returns {{
 *   filasSeleccionadas: Array,
 *   columnasVisibles:   Array,
 *   handleSelectionChange: Function,
 *   handleBulkCopy:        Function,
 *   handleBulkDelete:      Function,
 *   resetSelection:        Function,
 * }}
 */
export function useBulkActions(deleteRoute, vistaActual, bulkDeleteMethod = "post") {
    const [filasSeleccionadas, setFilasSeleccionadas] = useState([]);
    const [columnasVisibles, setColumnasVisibles] = useState([]);
    const [isConfirmingBulkDelete, setIsConfirmingBulkDelete] = useState(false);
    const resolvedDeleteRoute =
        typeof deleteRoute === "string" ? deleteRoute : deleteRoute?.[vistaActual];

    /** Recibe los datos del callback onSelectionChange de <DataTable />. */
    const handleSelectionChange = useCallback((datos, columnas) => {
        setFilasSeleccionadas(datos);
        setColumnasVisibles(columnas);
    }, []);

    /** Limpia la selección al cambiar de vista. */
    const resetSelection = useCallback(() => {
        setFilasSeleccionadas([]);
        setColumnasVisibles([]);
    }, []);

    /** Copia solo las columnas visibles al portapapeles en formato TSV (Excel-friendly). */
    const handleBulkCopy = useCallback(() => {
        if (filasSeleccionadas.length === 0) return;
        const EXCLUDED = ["select", "actions"];
        const visibleDataCols = columnasVisibles.filter(
            (id) => !EXCLUDED.includes(id),
        );
        const headerRow = visibleDataCols.join("\t");
        const dataRows = filasSeleccionadas
            .map((row) =>
                visibleDataCols.map((key) => row[key] ?? "").join("\t"),
            )
            .join("\n");
        navigator.clipboard.writeText(`${headerRow}\n${dataRows}`);
        alert("Copiado al portapapeles (solo columnas visibles)");
    }, [filasSeleccionadas, columnasVisibles]);

    const handleBulkDelete = useCallback(() => {
        if (filasSeleccionadas.length === 0) return;
        if (!resolvedDeleteRoute) {
            console.error("No se configuró una ruta de eliminación masiva para esta vista.");
            return;
        }
        setIsConfirmingBulkDelete(true);
    }, [filasSeleccionadas, resolvedDeleteRoute]);

    const executeBulkDelete = useCallback(() => {
        const ids = filasSeleccionadas.map((row) => row.id || row.matricula);
        const payload = { ids, tipo: vistaActual };
        const onSuccess = () => {
            resetSelection();
            setIsConfirmingBulkDelete(false);
        };

        if (!resolvedDeleteRoute) {
            console.error("No se configuró una ruta de eliminación masiva para esta vista.");
            return;
        }

        if (bulkDeleteMethod === "delete") {
            router.delete(resolvedDeleteRoute, {
                data: payload,
                preserveScroll: true,
                onSuccess,
            });
            return;
        }

        if (bulkDeleteMethod === "put") {
            router.put(resolvedDeleteRoute, payload, {
                preserveScroll: true,
                onSuccess,
            });
            return;
        }

        if (bulkDeleteMethod === "patch") {
            router.patch(resolvedDeleteRoute, payload, {
                preserveScroll: true,
                onSuccess,
            });
            return;
        }

        router.post(resolvedDeleteRoute, payload, {
            preserveScroll: true,
            onSuccess,
        });
    }, [filasSeleccionadas, resolvedDeleteRoute, vistaActual, bulkDeleteMethod, resetSelection]);

    return {
        filasSeleccionadas,
        columnasVisibles,
        handleSelectionChange,
        handleBulkCopy,
        handleBulkDelete,
        resetSelection,
        isConfirmingBulkDelete,
        setIsConfirmingBulkDelete,
        executeBulkDelete,
    };
}
