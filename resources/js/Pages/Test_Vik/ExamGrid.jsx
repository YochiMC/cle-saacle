import React, { memo } from "react";
import { CalendarX } from "lucide-react";
import CardExam from "./CardExam";
import GridPagination from "@/Components/DataTable/GridPagination";

/**
 * Componente presentacional encargado de renderizar el grid de tarjetas de exámenes
 * de forma paginada, o un mensaje de estado vacío si no hay resultados.
 * Se memoriza con React.memo para evitar re-renders innecesarios en grillas extensas.
 *
 * @component
 * @param {Object}   props
 * @param {Array<Object>}          props.examenesPaginados    - Exámenes a mostrar en la página actual.
 * @param {boolean}                props.hayFiltros           - Indica si el usuario aplicó filtros de búsqueda.
 * @param {number}                 props.paginaActual         - Número de la página actual.
 * @param {number}                 props.totalPaginas         - Cantidad total de páginas disponibles.
 * @param {function(number): void} props.onPageChange         - Handler de cambio de página.
 * @param {function(Object): void} props.onVerDetalles        - Abre el modal de vista rápida.
 * @param {function(string|number): void} props.onInscribir   - Ejecuta la inscripción al examen.
 * @param {function(Object): void} props.onEditar             - Abre el formulario de edición.
 * @param {Array<string|number>}  [props.examenesSeleccionados=[]] - IDs de exámenes seleccionados.
 * @param {function(string|number): void} [props.onToggleSelect]   - Alterna la selección individual.
 */
const ExamGrid = memo(({
    examenesPaginados,
    hayFiltros,
    paginaActual,
    totalPaginas,
    onPageChange,
    onVerDetalles,
    onInscribir,
    onEditar,
    examenesSeleccionados = [],
    onToggleSelect,
}) => {
    // ── Estado vacío ────────────────────────────────────────────────────────────
    if (!examenesPaginados || examenesPaginados.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 border border-blue-100">
                    <CalendarX
                        size={48}
                        className="text-[#1B396A] opacity-70"
                        strokeWidth={1.5}
                    />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                    {hayFiltros ? "No hay resultados" : "Sin exámenes programados"}
                </h3>
                <p className="text-gray-400 max-w-sm">
                    {hayFiltros
                        ? "Ajusta los filtros de búsqueda para encontrar sesiones de examen."
                        : "Aún no hay exámenes registrados en el sistema."}
                </p>
            </div>
        );
    }

    // ── Grilla responsiva + paginación ─────────────────────────────────────────
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {examenesPaginados.map((examen) => (
                    <CardExam
                        key={examen.id}
                        examen={examen}
                        seleccionado={examenesSeleccionados.includes(examen.id)}
                        onToggleSelect={onToggleSelect}
                        onVerDetalles={onVerDetalles}
                        onInscribir={onInscribir}
                        onEditar={onEditar}
                    />
                ))}
            </div>

            {totalPaginas > 1 && (
                <GridPagination
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    onPageChange={onPageChange}
                />
            )}
        </>
    );
});

export default ExamGrid;
