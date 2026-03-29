import React, { memo } from "react";
import { ThemeInput } from "@/Components/ThemeInput";
import {
    Search,
    ChevronDown,
    ToggleRight,
    ClipboardList,
    UsersRound,
} from "lucide-react";

/**
 * Barra de herramientas de filtrado para la vista de Exámenes.
 * Clon visual exacto de GroupFilters: mismas clases Tailwind, misma estructura,
 * con el filtro de "Niveles" reemplazado por "Tipos de Examen".
 *
 * @component
 * @param {Object}   props
 * @param {string}   props.busqueda              - Texto de búsqueda actual.
 * @param {function} props.setBusqueda           - Setter del texto de búsqueda.
 * @param {string}   props.filtroEstado          - Estado seleccionado en el filtro.
 * @param {function} props.setFiltroEstado       - Setter del estado del filtro.
 * @param {string}   props.filtroTipo            - Tipo de examen seleccionado.
 * @param {function} props.setFiltroTipo         - Setter del tipo de examen.
 * @param {Array}    props.statuses              - Opciones de estado [{value, label}].
 * @param {Array}    props.typeOptions           - Opciones de tipo de examen [{value, label}].
 * @param {number}   [props.totalFiltrados]      - Cantidad de exámenes que coinciden.
 * @param {string|null} props.ordenCupo          - Criterio de ordenamiento por disponibilidad.
 * @param {function} props.setOrdenCupo          - Setter del criterio de ordenamiento.
 */
const ExamFilters = memo(({
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    filtroTipo,
    setFiltroTipo,
    statuses = [],
    typeOptions = [],
    totalFiltrados,
    ordenCupo,
    setOrdenCupo,
}) => {
    // Clases base para los selectores — idénticas a GroupFilters
    const selectorClase =
        "w-full h-11 appearance-none pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg " +
        "shadow-sm text-sm font-medium text-gray-700 transition-all duration-200 cursor-pointer " +
        "hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 " +
        "focus:border-blue-500";

    return (
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            {/* Barra de Búsqueda */}
            <div className="flex-1 min-w-[300px]">
                <ThemeInput
                    leftIcon={Search}
                    placeholder="Buscar por nombre, docente, aula o fecha..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    wrapperClassName="w-full"
                    className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
            </div>

            {/* Selectores de Filtro y Ordenamiento */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Filtro por Estado */}
                <div className="relative min-w-[180px]">
                    <ToggleRight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5 pointer-events-none" />
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className={selectorClase}
                        aria-label="Filtrar por estado"
                    >
                        <option value="">Todos los estados</option>
                        {statuses.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Filtro por Tipo de Examen (reemplaza al de Niveles) */}
                <div className="relative min-w-[200px]">
                    <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5 pointer-events-none" />
                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className={selectorClase}
                        aria-label="Filtrar por tipo de examen"
                    >
                        <option value="">Todos los tipos</option>
                        {typeOptions.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>
                                {tipo.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Ordenamiento por Disponibilidad — idéntico a GroupFilters */}
                <div className="relative min-w-[220px]">
                    <UsersRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5 pointer-events-none" />
                    <select
                        value={ordenCupo || ""}
                        onChange={(e) => setOrdenCupo(e.target.value || null)}
                        className={selectorClase}
                        aria-label="Ordenar por disponibilidad"
                    >
                        <option value="">Orden: Por defecto</option>
                        <option value="desc">Disponibilidad: Alta a Baja</option>
                        <option value="asc">Disponibilidad: Baja a Alta</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Contador de Exámenes (Píldora) */}
            {totalFiltrados !== undefined && (
                <div className="ml-auto inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm whitespace-nowrap">
                    <span className="mr-2 flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                    {totalFiltrados} {totalFiltrados === 1 ? 'Examen encontrado' : 'Exámenes encontrados'}
                </div>
            )}
        </div>
    );
});

export default ExamFilters;
