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
        
        // columnasVisibles ahora es un array de objetos { id, header }
        const visibleDataCols = columnasVisibles.filter(
            (col) => !EXCLUDED.includes(col.id || col),
        );

        const headerRow = visibleDataCols.map(col => typeof col === 'object' ? col.header : col).join("\t");

        const getNestedValue = (obj, path) => {
            if (!path || !obj) return undefined;
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        };

        const dataRows = filasSeleccionadas
            .map((row) =>
                visibleDataCols.map((col) => {
                    const key = typeof col === 'object' ? col.id : col;
                    let val = getNestedValue(row, key);
                    if (val === null || val === undefined) val = "";
                    if (typeof val === 'object' && val !== null) {
                        val = val.label || val.value || val.name || val.full_name || JSON.stringify(val);
                    }
                    return String(val).replace(/\t/g, ' ').replace(/\n/g, ' ');
                }).join("\t"),
            )
            .join("\n");
            
        const textToCopy = `${headerRow}\n${dataRows}`;

        const showToast = (type, message) => {
            window.dispatchEvent(new CustomEvent('show-flash', {
                detail: { type, title: type === 'success' ? 'Éxito' : 'Error', message }
            }));
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => showToast('success', 'Se han copiado las columnas visibles al portapapeles. Ahora puedes pegarlas en Excel.'))
                .catch(() => showToast('error', 'Hubo un error al copiar al portapapeles.'));
        } else {
            // Fallback robusto para conexiones HTTP en LAN (como 192.168.x.x)
            try {
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                textArea.style.position = "fixed";
                textArea.style.top = "-999999px";
                textArea.style.left = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    showToast('success', 'Se han copiado las columnas visibles al portapapeles. Ahora puedes pegarlas en Excel.');
                } else {
                    showToast('error', 'El navegador bloqueó la copia al portapapeles.');
                }
            } catch (err) {
                showToast('error', 'Hubo un problema inesperado al copiar los datos.');
                console.error(err);
            }
        }
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
