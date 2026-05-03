// ── React ──────────────────────────────────────────────────────────────────
import { useRef } from 'react';

// ── Librería de impresión (dispara el diálogo nativo del navegador) ─────────
import { useReactToPrint } from 'react-to-print';

// ── Íconos ──────────────────────────────────────────────────────────────────
import { Printer, X } from 'lucide-react';

// ── Componentes propios ─────────────────────────────────────────────────────
import { ThemeButton } from '@/Components/ui/ThemeButton';
import PrintableReport from '@/Components/DataTable/PrintableReport';

/**
 * @component ReportPreviewModal
 *
 * Ventana flotante (modal) que muestra una vista previa HTML del reporte
 * institucional antes de que el usuario lo guarde como PDF.
 *
 * Flujo completo:
 *   1. DataTableToolbar llama a getPrintableData() y abre este modal.
 *   2. ReportPreviewModal renderiza <PrintableReport> con esos datos.
 *   3. useReactToPrint captura el DOM de PrintableReport via `componentRef`.
 *   4. El botón "Confirmar" llama a handlePrint() → se abre el diálogo nativo
 *      de impresión/PDF del navegador con el contenido ya formateado.
 *
 * ¿Por qué react-to-print en lugar de window.print()?
 * window.print() imprime TODA la página. react-to-print inyecta solo el
 * sub-árbol del DOM al que apunta `contentRef` en un iframe temporal,
 * dando control total sobre qué se imprime y con qué estilos.
 *
 * @param {boolean}  isOpen    - Controla si el modal está visible o no.
 * @param {Function} onClose   - Callback para cerrar el modal (desde el padre).
 * @param {object}   tableData - Datos preparados por `getPrintableData()`:
 *                               { headers, rows, visibleColumns }.
 * @param {string}   title     - Título del reporte visible en la hoja imprimible.
 */
export default function ReportPreviewModal({
    isOpen,
    onClose,
    tableData = {},
    title = 'Reporte Institucional',
}) {
    /*
     * `componentRef` apunta al nodo DOM del <PrintableReport>.
     * react-to-print lo usa para clonar ese sub-árbol en un iframe
     * oculto con los estilos correspondientes y enviarlo a la impresora.
     */
    const componentRef = useRef(null);

    /*
     * useReactToPrint — API de react-to-print v3
     *
     * En v2 se usaba: content: () => componentRef.current  (callback)
     * En v3 se usa:   contentRef: componentRef             (ref directa)
     *
     * `documentTitle` define el nombre del archivo cuando el usuario
     * elige "Guardar como PDF" en el diálogo del navegador.
     */
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: title,
    });

    /*
     * Early return pattern: si el modal está cerrado, no renderizamos nada.
     * Esto evita montar el DOM del modal (y PrintableReport) innecesariamente,
     * mejorando el rendimiento cuando hay muchas filas de datos.
     */
    if (!isOpen) return null;

    // Desestructuramos con defaults para protegernos de tableData vacío
    const { headers = [], rows = [], visibleColumns = [] } = tableData;

    return (
        /*
         * ── OVERLAY ──────────────────────────────────────────────────────────
         * `fixed inset-0` cubre la pantalla completa sobre todo el contenido.
         * `z-50` garantiza que el modal esté por encima de cualquier otro elemento.
         * `backdrop-blur-sm` desenfoca el contenido de fondo sutilmente.
         *
         * El onClick en el div del overlay implementa el patrón "clic fuera = cerrar":
         * `e.target === e.currentTarget` es true solo si el clic ocurrió en el
         * overlay mismo, no en un elemento hijo (el panel blanco).
         */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            onClick={(e) => {
                // Solo cerramos si el clic fue directamente en el overlay,
                // no propagado desde un botón o la tabla interna.
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/*
             * ── CONTENEDOR PRINCIPAL ──────────────────────────────────────────
             * `max-w-4xl` limita el ancho para que se vea la hoja A4 con margen.
             * `max-h-[90vh]` + `flex flex-col` + `overflow-hidden` en el padre
             * permiten que el área de vista previa (hijo) tenga scroll independiente.
             */}
            <div className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

                {/*
                 * ── HEADER DEL MODAL ──────────────────────────────────────────
                 * `flex-shrink-0` evita que este header se comprima cuando el
                 * contenido de abajo es muy largo y ocupa todo el espacio.
                 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex-shrink-0">
                    <div>
                        {/* id aquí para ser referenciado por aria-labelledby del overlay */}
                        <h2
                            id="report-modal-title"
                            className="text-base font-bold text-[#17365D]"
                        >
                            Vista previa del reporte
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Revisa el documento antes de guardar como PDF.
                        </p>
                    </div>

                    {/* ── Botones de acción ─────────────────────────────────── */}
                    <div className="flex items-center gap-2">
                        {/* Cancelar: cierra el modal sin imprimir */}
                        <ThemeButton
                            theme="outline"
                            icon={X}
                            size="sm"
                            onClick={onClose}
                        >
                            Cancelar
                        </ThemeButton>

                        {/* Confirmar: dispara handlePrint() → diálogo nativo del SO */}
                        <ThemeButton
                            theme="institutional"
                            icon={Printer}
                            size="sm"
                            onClick={handlePrint}
                        >
                            Confirmar y Guardar PDF
                        </ThemeButton>
                    </div>
                </div>

                {/*
                 * ── ÁREA DE VISTA PREVIA ──────────────────────────────────────
                 * `flex-1 overflow-auto`: ocupa el espacio restante y agrega
                 * scroll si el reporte A4 es más alto que el viewport.
                 * `bg-gray-100`: imita el fondo gris de los visores de PDF,
                 * ayudando a percibir los bordes de la hoja blanca.
                 */}
                <div className="flex-1 overflow-auto bg-gray-100 p-6">
                    {/*
                     * La ref `componentRef` se pasa a PrintableReport via forwardRef.
                     * react-to-print leerá componentRef.current para capturar el DOM.
                     */}
                    <PrintableReport
                        ref={componentRef}
                        title={title}
                        headers={headers}
                        rows={rows}
                        visibleColumns={visibleColumns}
                    />
                </div>
            </div>
        </div>
    );
}
