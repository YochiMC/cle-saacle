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
const ResourceFilterBar = memo(
    ({
        busqueda,
        setBusqueda,
        searchPlaceholder = "Buscar...",
        totalFiltrados,
        resultSingularLabel = "Elemento encontrado",
        resultPluralLabel = "Elementos encontrados",
        children,
    }) => {
        return (
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="flex-1 min-w-[300px]">
                    <ThemeInput
                        leftIcon={Search}
                        placeholder={searchPlaceholder}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        wrapperClassName="w-full"
                        className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {children}
                </div>

                {totalFiltrados !== undefined && (
                    <div className="ml-auto inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm whitespace-nowrap">
                        <span className="mr-2 flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                        {totalFiltrados}{" "}
                        {totalFiltrados === 1
                            ? resultSingularLabel
                            : resultPluralLabel}
                    </div>
                )}
            </div>
        );
    },
);

export default ResourceFilterBar;
