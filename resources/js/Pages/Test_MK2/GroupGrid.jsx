import React, { memo } from "react";
import { UsersRound } from "lucide-react";
import CardGroup from "@/Components/Charts/CardGroup";
import GridPagination from "@/Components/DataTable/GridPagination";

/**
 * Componente presentacional encargado de renderizar el grid de tarjetas de grupos
 * de forma paginada o un mensaje de estado vacío.
 * Se memoriza para optimizar renders innecesarios.
 *
 * @param {Object} props
 * @param {Array<Object>} props.gruposPaginados - Grupos a mostrar en la página actual.
 * @param {boolean} props.hayFiltros - Indica si el usuario aplicó filtros de búsqueda.
 * @param {number} props.paginaActual - Número de la página actual.
 * @param {number} props.totalPaginas - Cantidad total de páginas disponibles.
 * @param {function(number): void} props.onPageChange - Handler de cambio de página.
 * @param {Object} props.auth - Objeto con datos del usuario autenticado y sus roles.
 * @param {function(Object): void} props.onVerDetalles - Función para abrir el modal de detalles.
 * @param {function(string|number): void} props.onInscribir - Función para ejecutar la inscripción.
 * @param {function(Object): void} props.onEditar - Función para abrir la edición del grupo.
 */
const GroupGrid = memo(({
    gruposPaginados,
    hayFiltros,
    paginaActual,
    totalPaginas,
    onPageChange,
    auth,
    onVerDetalles,
    onInscribir,
    onEditar,
}) => {
    if (gruposPaginados.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 border border-blue-100">
                    <UsersRound
                        size={48}
                        className="text-[#1B396A] opacity-70"
                        strokeWidth={1.5}
                    />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                    {hayFiltros ? "No hay resultados" : "Sin grupos registrados"}
                </h3>
                <p className="text-gray-400 max-w-sm">
                    {hayFiltros
                        ? "No encontramos ningún grupo que coincida con los filtros seleccionados."
                        : "Aún no hay grupos registrados en el sistema."}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {gruposPaginados.map((grupo) => (
                    <CardGroup
                        key={grupo.id}
                        grupo={grupo}
                        auth={auth}
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

export default GroupGrid;
