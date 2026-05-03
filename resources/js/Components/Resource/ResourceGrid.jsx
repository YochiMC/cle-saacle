import React, { memo } from "react";
import { UsersRound } from "lucide-react";
import GridPagination from "@/Components/DataTable/GridPagination";

/**
 * Grid genérico para renderizar recursos por tarjetas.
 *
 * @param {Object} props
 * @param {Array<Object>} props.items
 * @param {React.ComponentType<any>} props.CardComponent
 * @param {function(Object, number): Object} [props.getCardProps]
 * @param {function(Object, number): string|number} [props.getItemKey]
 * @param {boolean} props.hayFiltros
 * @param {number} props.paginaActual
 * @param {number} props.totalPaginas
 * @param {function(number): void} props.onPageChange
 * @param {React.ComponentType<any>} [props.EmptyIcon]
 * @param {string} [props.emptyTitle]
 * @param {string} [props.emptyMessage]
 * @param {string} [props.emptyFilteredTitle]
 * @param {string} [props.emptyFilteredMessage]
 * @param {string} [props.gridClassName]
 */
const ResourceGrid = memo(
    ({
        items = [],
        CardComponent,
        getCardProps = (item) => ({ item }),
        getItemKey = (item) => item.id,
        hayFiltros,
        paginaActual,
        totalPaginas,
        onPageChange,
        EmptyIcon = UsersRound,
        emptyTitle = "Sin elementos registrados",
        emptyMessage = "Aun no hay elementos registrados en el sistema.",
        emptyFilteredTitle = "No hay resultados",
        emptyFilteredMessage = "No encontramos elementos que coincidan con los filtros seleccionados.",
        gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch",
    }) => {
        if (items.length === 0) {
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

        if (!CardComponent) return null;

        return (
            <>
                <div className={gridClassName}>
                    {items.map((item, index) => (
                        <CardComponent
                            key={getItemKey(item, index)}
                            {...getCardProps(item, index)}
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
    },
);

export default ResourceGrid;
