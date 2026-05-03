import React, { memo } from "react";
import { UsersRound } from "lucide-react";
import GridPagination from "@/Components/DataTable/GridPagination";

/**
 * Grid de Datos Genérico (SRP y OCP)
 * Recibe los datos ya procesados y delega la responsabilidad visual de 
 * cada ítem a la función `renderCard` inyectada por el consumidor.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Lista de elementos a renderizar.
 * @param {function(Object, number): React.ReactNode} props.renderCard - Render prop para el ítem.
 * @param {function(Object, number): string|number} [props.getItemKey] - Extraer key.
 * @param {boolean} props.hayFiltros - Indica si existen filtros de búsqueda activos.
 * @param {number} props.paginaActual - Página actual de la paginación.
 * @param {number} props.totalPaginas - Total de páginas disponibles.
 * @param {function(number): void} props.onPageChange - Handler para cambio de página.
 * @param {React.ComponentType<any>} [props.EmptyIcon]
 * @param {string} [props.emptyTitle]
 * @param {string} [props.emptyMessage]
 * @param {string} [props.emptyFilteredTitle]
 * @param {string} [props.emptyFilteredMessage]
 * @param {string} [props.gridClassName]
 */
const DataGrid = memo(
    ({
        data = [],
        renderCard,
        getItemKey = (item) => item.id,
        hayFiltros,
        paginaActual,
        totalPaginas,
        onPageChange,
        EmptyIcon = UsersRound,
        emptyTitle = "Sin elementos registrados",
        emptyMessage = "Aún no hay elementos registrados en el sistema.",
        emptyFilteredTitle = "No hay resultados",
        emptyFilteredMessage = "No encontramos elementos que coincidan con los filtros seleccionados.",
        gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch",
    }) => {
        if (!data || data.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 border border-blue-100">
                        <EmptyIcon
                            size={48}
                            className="text-[#1B396A] opacity-70"
                            strokeWidth={1.5}
                        />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                        {hayFiltros ? emptyFilteredTitle : emptyTitle}
                    </h3>
                    <p className="text-gray-400 max-w-sm">
                        {hayFiltros ? emptyFilteredMessage : emptyMessage}
                    </p>
                </div>
            );
        }

        if (!renderCard) return null;

        return (
            <>
                <div className={gridClassName}>
                    {data.map((item, index) => (
                        <React.Fragment key={getItemKey(item, index)}>
                            {renderCard(item, index)}
                        </React.Fragment>
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
    }
);

export default DataGrid;
