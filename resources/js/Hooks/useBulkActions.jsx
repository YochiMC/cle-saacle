import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';

/**
 * useBulkActions
 *
 * Encapsula todo el estado y los manejadores de las acciones masivas:
 * selección de filas, copiado WYSIWYG a portapapeles y eliminación masiva.
 *
 * @param {string} deleteRoute  - Ruta POST de Inertia para eliminación masiva.
 * @param {string} vistaActual  - Clave de la vista activa (se envía al servidor junto con los ids).
 * @returns {{
 *   filasSeleccionadas: Array,
 *   columnasVisibles:   Array,
 *   handleSelectionChange: Function,
 *   handleBulkCopy:        Function,
 *   handleBulkDelete:      Function,
 *   resetSelection:        Function,
 * }}
 */
export function useBulkActions(deleteRoute, vistaActual) {
    const [filasSeleccionadas, setFilasSeleccionadas] = useState([]);
    const [columnasVisibles, setColumnasVisibles] = useState([]);

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
        const EXCLUDED = ['select', 'actions'];
        const visibleDataCols = columnasVisibles.filter((id) => !EXCLUDED.includes(id));
        const headerRow = visibleDataCols.join('\t');
        const dataRows = filasSeleccionadas
            .map((row) => visibleDataCols.map((key) => row[key] ?? '').join('\t'))
            .join('\n');
        navigator.clipboard.writeText(`${headerRow}\n${dataRows}`);
        alert('Copiado al portapapeles (solo columnas visibles)');
    }, [filasSeleccionadas, columnasVisibles]);

    /** Envía los IDs seleccionados al servidor para eliminación masiva. */
    const handleBulkDelete = useCallback(() => {
        if (filasSeleccionadas.length === 0) return;
        if (confirm(`¿Estás seguro de eliminar ${filasSeleccionadas.length} registros?`)) {
            const ids = filasSeleccionadas.map((row) => row.id || row.matricula);
            router.post(deleteRoute, { ids, tipo: vistaActual });
        }
    }, [filasSeleccionadas, deleteRoute, vistaActual]);

    return {
        filasSeleccionadas,
        columnasVisibles,
        handleSelectionChange,
        handleBulkCopy,
        handleBulkDelete,
        resetSelection,
    };
}
