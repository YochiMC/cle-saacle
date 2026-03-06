import { forwardRef } from 'react';

/**
 * @component PrintableReport
 *
 * Hoja A4 con diseño institucional lista para impresión / exportación a PDF.
 * Es el "documento real" que el usuario verá cuando pulse Ctrl+P o guarde como PDF.
 *
 * ¿Por qué forwardRef?
 * react-to-print necesita acceder directamente al nodo del DOM para capturarlo.
 * forwardRef expone la ref interna del componente al componente padre
 * (ReportPreviewModal), quien la pasa a `useReactToPrint({ contentRef })`.
 *
 * Dimensiones A4:
 *   210 mm × 297 mm ≈ 794 px × 1123 px a 96 dpi (resolución estándar de pantalla).
 *
 * @param {string}   title          - Título principal que aparece en la cabecera.
 * @param {string[]} headers        - Nombres de las columnas (ya resueltos a string).
 * @param {object[]} rows           - Filas de TanStack Table; cada una expone `getValue(colId)`.
 * @param {object[]} visibleColumns - Columnas TanStack actualmente visibles (excluye UI pura).
 * @param {React.Ref} ref           - Ref que react-to-print usará para capturar este DOM.
 */
const PrintableReport = forwardRef(function PrintableReport(
    { title = 'Reporte Institucional', headers = [], rows = [], visibleColumns = [] },
    ref,
) {
    const today = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        /* ── Wrapper exterior: invisible en pantalla, limpio en impresión ── */
        <div className="print:shadow-none print:p-0">
            {/*
             * ── Hoja A4 ──────────────────────────────────────────────────────
             * En pantalla: ancho fijo A4 con sombra de papel.
             * En impresión: ocupa el 100 % de la página física.
             */}
            <div
                ref={ref}
                className="
                    relative mx-auto bg-white text-black font-sans
                    w-[794px] min-h-[1123px]
                    p-10
                    shadow-2xl
                    print:w-full print:min-h-0 print:shadow-none print:p-8
                "
            >
                {/* ── CABECERA ─────────────────────────────────────────────── */}
                <header className="flex items-start gap-6 mb-6">
                    {/* Espacio para logo institucional */}
                    <div
                        className="
                            flex-shrink-0
                            w-24 h-24
                            border-2 border-dashed border-gray-300
                            rounded-lg
                            flex items-center justify-center
                            bg-gray-50
                        "
                    >
                        <span className="text-[10px] text-gray-400 text-center leading-tight px-1">
                            LOGO<br />ESCUELA
                        </span>
                    </div>

                    {/* Texto institucional */}
                    <div className="flex-1">
                        <p className="text-xs font-semibold tracking-widest uppercase text-[#17365D] mb-0.5">
                            Sistema de Gestión Escolar
                        </p>
                        <h1 className="text-2xl font-extrabold text-[#17365D] leading-tight">
                            {title}
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                            Generado el {today}
                        </p>
                    </div>
                </header>

                {/* ── LÍNEA DIVISORIA ──────────────────────────────────────── */}
                <div className="border-b-2 border-[#17365D] mb-6" />

                {/* ── TABLA DE DATOS ───────────────────────────────────────── */}
                {rows.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-12">
                        No hay datos para mostrar.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            {/* ENCABEZADOS */}
                            <thead>
                                <tr>
                                    {headers.map((header, idx) => (
                                        <th
                                            key={idx}
                                            className="
                                                bg-[#17365D] text-white
                                                text-left text-xs font-bold uppercase tracking-wider
                                                px-3 py-2.5
                                                border border-[#0f2440]
                                                first:rounded-tl-md last:rounded-tr-md
                                            "
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* CUERPO */}
                            <tbody>
                                {rows.map((row, rowIdx) => {
                                    const isEven = rowIdx % 2 === 0;
                                    return (
                                        <tr
                                            key={rowIdx}
                                            className={
                                                isEven
                                                    ? 'bg-white'
                                                    : 'bg-[#EDF2F9]'
                                            }
                                        >
                                            {visibleColumns.map((col) => {
                                                const val = row.getValue(col.id);
                                                return (
                                                    <td
                                                        key={col.id}
                                                        className="
                                                            px-3 py-2
                                                            text-gray-700
                                                            border border-gray-200
                                                            align-top
                                                        "
                                                    >
                                                        {val === null || val === undefined
                                                            ? '—'
                                                            : String(val)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── PIE DE PÁGINA ────────────────────────────────────────── */}
                <footer className="absolute bottom-8 left-10 right-10 flex justify-between items-center border-t border-gray-200 pt-3">
                    <p className="text-[10px] text-gray-400">
                        Documento generado automáticamente — uso interno
                    </p>
                    <p className="text-[10px] text-gray-400">
                        Total de registros: <strong className="text-gray-600">{rows.length}</strong>
                    </p>
                </footer>
            </div>
        </div>
    );
});

PrintableReport.displayName = 'PrintableReport';

export default PrintableReport;
