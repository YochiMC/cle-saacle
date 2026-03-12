import React, { memo } from "react";
import { ThemeInput } from "@/Components/ThemeInput";
import { 
    Search, 
    ChevronDown, 
    ToggleRight, 
    Layers3, 
    UsersRound 
} from "lucide-react";

/**
 * Componente presentacional encargado de renderizar la barra de búsqueda, filtros y ordenamiento.
 * Implementa una UI premium con alineación horizontal y controles optimizados.
 *
 * @param {Object} props
 * @param {string} props.busqueda - Texto actual en la barra de búsqueda.
 * @param {function(string): void} props.setBusqueda - Función para actualizar la búsqueda.
 * @param {string} props.filterStatus - Estado seleccionado para el filtro.
 * @param {function(string): void} props.setFilterStatus - Función para actualizar el estado del filtro.
 * @param {string} props.filterLevel - ID del nivel seleccionado.
 * @param {function(string): void} props.setFilterLevel - Función para actualizar el nivel del filtro.
 * @param {Array<{id: number, level_tecnm: string, name: string}>} [props.levels=[]] - Catálogo de niveles.
 * @param {number} [props.totalFiltrados] - Cantidad total de grupos que coinciden con los filtros.
 * @param {string|null} props.ordenCupo - Criterio de ordenamiento actual por disponibilidad.
 * @param {function(string|null): void} props.setOrdenCupo - Función para actualizar el ordenamiento.
 */
const GroupFilters = memo(({
    busqueda,
    setBusqueda,
    filterStatus,
    setFilterStatus,
    filterLevel,
    setFilterLevel,
    levels = [],
    totalFiltrados,
    ordenCupo,
    setOrdenCupo,
}) => {
    // Clases base para los selectores premium
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
                    placeholder="Buscar por grupo, docente o nivel..."
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
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={selectorClase}
                        aria-label="Filtrar por estado"
                    >
                        <option value="">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="waiting">En espera</option>
                        <option value="inactive">Inactivos</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Filtro por Nivel */}
                <div className="relative min-w-[200px]">
                    <Layers3 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5 pointer-events-none" />
                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className={selectorClase}
                        aria-label="Filtrar por nivel"
                    >
                        <option value="">Todos los niveles</option>
                        {levels.map((nivel) => (
                            <option key={nivel.id} value={nivel.id}>
                                {nivel.level_tecnm || nivel.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Ordenamiento por Disponibilidad */}
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

            {/* Contador de Grupos (Píldora) */}
            {totalFiltrados !== undefined && (
                <div className="ml-auto inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm whitespace-nowrap">
                    <span className="mr-2 flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                    {totalFiltrados} {totalFiltrados === 1 ? 'Grupo encontrado' : 'Grupos encontrados'}
                </div>
            )}
        </div>
    );
});

export default GroupFilters;
