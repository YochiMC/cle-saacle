// ── Librería de hojas de cálculo (genera .xlsx nativamente en el navegador)
import * as XLSX from 'xlsx';

/**
 * @hook useTableExport
 *
 * Principio de Responsabilidad Única (SRP) aplicado:
 * Este Custom Hook centraliza TODA la lógica de exportación de datos,
 * dejando a los componentes visuales libres de cualquier procesamiento.
 *
 * Pipeline de datos en TanStack Table v8:
 *   Core → Column Filters → Global Filter → Sorting → Grouping → Pagination
 *
 * CSV / Excel usan `getFilteredRowModel` (post-filtro, pre-paginación).
 * PDF usa `getCoreRowModel` para incluir el 100 % de registros sin importar
 * la página activa ni los filtros de búsqueda.
 *
 * @param   {import('@tanstack/react-table').Table} table - Instancia de TanStack Table.
 * @returns {{ exportToCSV: Function, exportToExcel: Function, getPrintableData: Function }}
 */
export function useTableExport(table) {
    /**
     * Columnas de UI pura que no contienen datos exportables.
     * 'select'  → checkbox de selección de fila
     * 'actions' → botones de editar/eliminar
     * Usamos Set para que la búsqueda sea O(1) en lugar de O(n).
     */
    const EXCLUDED_COLUMNS = new Set(['select', 'actions']);

    // ── Función auxiliar privada ──────────────────────────────────────────────

    /**
     * @private
     * Calcula las columnas actualmente visibles (excluyendo UI) y sus
     * encabezados textuales. También devuelve las filas ya filtradas.
     * Es usada internamente por `exportToCSV` y `exportToExcel`.
     *
     * @returns {{ visibleColumns: object[], headers: string[], rows: object[] }}
     */
    const getVisibleData = () => {
        // Obtenemos solo las hojas-hoja (leaf columns) visibles,
        // filtrando las columnas de UI declaradas en EXCLUDED_COLUMNS.
        const visibleColumns = table
            .getVisibleLeafColumns()
            .filter((col) => !EXCLUDED_COLUMNS.has(col.id));

        // Intentamos leer el header como string; si es un componente JSX
        // (función), usamos el id de la columna como fallback legible.
        const headers = visibleColumns.map((col) => {
            const header = col.columnDef.header;
            return typeof header === 'string' ? header : col.id;
        });

        // getFilteredRowModel: filas que pasaron el filtro global/columnas,
        // ANTES de que la paginación recorte la vista a una sola página.
        const rows = table.getFilteredRowModel().rows;

        return { visibleColumns, headers, rows };
    };

    // ── Exportar a CSV ────────────────────────────────────────────────────────

    /**
     * Genera y descarga un archivo `.csv` con los datos visibles y filtrados.
     * Incluye soporte completo para caracteres especiales (acentos, ñ).
     */
    const exportToCSV = () => {
        const { visibleColumns, headers, rows } = getVisibleData();

        /**
         * Escapa un valor de celda siguiendo la especificación RFC 4180:
         * - Si contiene coma, comilla o salto de línea → lo envuelve en "..."
         * - Las comillas internas se duplican ("" es el escape estándar de CSV)
         */
        const escapeCell = (value) => {
            if (value === null || value === undefined) return '';
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        // Construimos cada fila de datos como una cadena CSV escapada
        const csvRows = rows.map((row) =>
            visibleColumns
                .map((col) => escapeCell(row.getValue(col.id)))
                .join(','),
        );

        // \uFEFF es el BOM (Byte Order Mark) de UTF-8.
        // Excel lo usa para detectar el encoding y mostrar acentos y ñ
        // correctamente sin configuración extra del usuario.
        const csvContent =
            '\uFEFF' + [headers.join(','), ...csvRows].join('\n');

        // Técnica del "anchor fantasma": creamos un <a> dinámico,
        // lo activamos programáticamente y lo eliminamos del DOM.
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob); // URL temporal en memoria
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Reporte.csv');
        document.body.appendChild(link);
        link.click();                           // dispara la descarga
        document.body.removeChild(link);        // limpieza del DOM
        URL.revokeObjectURL(url);               // libera la memoria del blob
    };

    // ── Exportar a Excel nativo (.xlsx) ──────────────────────────────────────

    /**
     * Genera y descarga un archivo `.xlsx` real (no un CSV disfrazado).
     * Usa la librería SheetJS (`xlsx`) para construir el workbook en memoria.
     * Aplica ajuste automático de ancho de columnas para mejor legibilidad.
     */
    const exportToExcel = () => {
        const { visibleColumns, headers, rows } = getVisibleData();

        // SheetJS trabaja con "array of arrays" (aoa): cada sub-array es una fila.
        // La primera fila son los encabezados; las siguientes son los datos.
        const sheetData = [
            headers, // fila 1: nombres de columna
            ...rows.map((row) =>
                visibleColumns.map((col) => {
                    const val = row.getValue(col.id);
                    // Preservamos null/undefined como cadena vacía para evitar
                    // que SheetJS los convierta al texto "null" en la celda.
                    return val === null || val === undefined ? '' : val;
                }),
            ),
        ];

        // Creamos el workbook (libro) y convertimos nuestro aoa a worksheet (hoja)
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

        // Calculamos el ancho óptimo de cada columna midiendo el contenido más largo.
        // `wch` = "width in characters", propiedad nativa de SheetJS.
        // El +2 agrega margen visual y el Math.min(…, 40) limita columnas enormes.
        const colWidths = headers.map((h, i) => {
            const maxLen = Math.max(
                String(h).length,
                ...rows.map((row) => {
                    const val = row.getValue(visibleColumns[i].id);
                    return val !== null && val !== undefined
                        ? String(val).length
                        : 0;
                }),
            );
            return { wch: Math.min(maxLen + 2, 40) };
        });
        worksheet['!cols'] = colWidths; // inyectamos los anchos en la hoja

        // Agregamos la hoja al libro y disparamos la descarga directa
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
        XLSX.writeFile(workbook, 'Reporte.xlsx');
    };

    // ── Datos para vista previa de impresión / PDF ───────────────────────────

    /**
     * Prepara los datos para que `ReportPreviewModal` y `PrintableReport`
     * los consuman y rendericen la hoja imprimible.
     *
     * ⚠️ DIFERENCIA CLAVE respecto a `getVisibleData`:
     * Usa `getCoreRowModel()` en lugar de `getFilteredRowModel()` para
     * garantizar que el PDF contenga el 100 % de registros de la tabla,
     * sin importar la página activa ni los filtros de búsqueda vigentes.
     *
     * Pipeline de TanStack: Core → Filtros → Orden → Paginación
     *                         ↑ aquí tomamos los datos (antes de todo)
     *
     * Si en el futuro deseas que el PDF respete el buscador pero no la
     * paginación, cambia `getCoreRowModel()` por `getFilteredRowModel()`.
     *
     * @returns {{ headers: string[], rows: object[], visibleColumns: object[] }}
     */
    const getPrintableData = () => {
        // Reutilizamos la misma lógica de columnas visibles que en getVisibleData
        const visibleColumns = table
            .getVisibleLeafColumns()
            .filter((col) => !EXCLUDED_COLUMNS.has(col.id));

        const headers = visibleColumns.map((col) => {
            const header = col.columnDef.header;
            return typeof header === 'string' ? header : col.id;
        });

        // getCoreRowModel() devuelve TODOS los registros cargados en la tabla,
        // ignorando tanto la paginación como los filtros de búsqueda activos.
        const rows = table.getCoreRowModel().rows;

        return { visibleColumns, headers, rows };
    };

    // ── API pública del hook ──────────────────────────────────────────────────
    return { exportToCSV, exportToExcel, getPrintableData };
}

export default useTableExport;
