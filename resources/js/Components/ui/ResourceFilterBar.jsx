import React, { memo } from "react";
import { Search } from "lucide-react";
import { ThemeInput } from "@/Components/ui/ThemeInput";

/**
 * Barra genérica de busqueda y filtros por composicion.
 *
 * @param {Object} props
 * @param {string} props.busqueda
 * @param {function(string): void} props.setBusqueda
 * @param {string} [props.searchPlaceholder]
 * @param {number} [props.totalFiltrados]
 * @param {string} [props.resultSingularLabel]
 * @param {string} [props.resultPluralLabel]
 * @param {React.ReactNode} [props.children]
 */
const ResourceFilterBar = ({
    busqueda,
    setBusqueda,
    searchPlaceholder = "Buscar...",
    totalFiltrados = 0,
    resultSingularLabel = "Elemento encontrado",
    resultPluralLabel = "Elementos encontrados",
    children,
}) => {
    return (
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4">
            <div className="w-full flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                {/* Search - ocupa la mayor parte en escritorio */}
                <div className="min-w-0 flex-1">
                    <ThemeInput
                        leftIcon={Search}
                        placeholder={searchPlaceholder}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        wrapperClassName="w-full"
                        className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                </div>

                {/* Filters + resultado - en desktop se mantienen en una fila junto a la búsqueda; en móvil se apilan */}
                <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:flex-none">
                    <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
                        {children}
                    </div>

                    <div className="ml-auto inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm whitespace-nowrap">
                        <span className="mr-2 flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                        {totalFiltrados} {totalFiltrados === 1 ? resultSingularLabel : resultPluralLabel}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(ResourceFilterBar);
