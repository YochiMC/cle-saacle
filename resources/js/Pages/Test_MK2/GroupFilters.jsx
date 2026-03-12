import React, { memo } from "react";
import { ThemeInput } from "@/Components/ThemeInput";
import { Search, ChevronDown } from "lucide-react";

/**
 * Componente presentacional (Dumb) que renderiza la barra de búsqueda y filtros.
 * Se memoriza para evitar re-renderizados si las propiedades no cambian.
 *
 * @param {Object} props
 * @param {string} props.busqueda - Cadena de texto actual en la barra de búsqueda.
 * @param {function(string): void} props.setBusqueda - Inyecta cambios de texto.
 * @param {string} props.filterStatus - Estado seleccionado (activo, en espera, etc.).
 * @param {function(string): void} props.setFilterStatus - Inyecta el cambio de estado.
 * @param {string} props.filterLevel - ID del nivel seleccionado.
 * @param {function(string): void} props.setFilterLevel - Inyecta el cambio de nivel.
 * @param {Array<{id: number, level_tecnm: string, name: string}>} [props.levels=[]] - Arreglo de niveles.
 * @param {number} [props.totalFiltrados] - Cantidad total resultante de la búsqueda.
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
}) => {
    const selectCls =
        "h-10 w-full appearance-none rounded-md border border-gray-300 bg-white " +
        "pl-3 pr-10 py-2 text-sm text-gray-700 shadow-sm " +
        "transition-colors duration-200 cursor-pointer " +
        "focus:outline-none focus:ring-2 focus:ring-[#1B396A]/20 focus:border-[#1B396A]";

    return (
        <div className="flex flex-wrap items-center gap-3 py-4">
            <ThemeInput
                leftIcon={Search}
                placeholder="Buscar por grupo, docente o nivel..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                wrapperClassName="max-w-sm"
            />

            <div className="relative">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={selectCls}
                    aria-label="Filtrar por estado"
                >
                    <option value="">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="waiting">En espera</option>
                    <option value="inactive">Inactivo</option>
                </select>
                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
            </div>

            <div className="relative">
                <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className={selectCls}
                    aria-label="Filtrar por nivel"
                >
                    <option value="">Todos los niveles</option>
                    {levels.map((level) => (
                        <option key={level.id} value={level.id}>
                            {level.level_tecnm || level.name}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
            </div>

            {totalFiltrados !== undefined && (
                <div className="ml-auto text-sm text-slate-500">
                    {totalFiltrados} grupos
                </div>
            )}
        </div>
    );
});

export default GroupFilters;
