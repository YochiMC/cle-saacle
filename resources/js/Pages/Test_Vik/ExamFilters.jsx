import React, { memo } from "react";
import { ThemeInput } from "@/Components/ThemeInput";
import { Search, ChevronDown, ToggleRight, Layers3, UsersRound } from "lucide-react";

const ExamFilters = memo(({
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
    const selectorClase = 
        "w-full h-11 appearance-none pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg " +
        "shadow-sm text-sm font-medium text-gray-700 transition-all duration-200 cursor-pointer " +
        "hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 " +
        "focus:border-blue-500";

    return (
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex-1 min-w-[300px]">
                <ThemeInput
                    leftIcon={Search}
                    placeholder="Buscar por nombre de examen o fecha..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    wrapperClassName="w-full"
                    className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[180px]">
                    <ToggleRight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5 pointer-events-none" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={selectorClase}
                    >
                        <option value="">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="waiting">En espera</option>
                        <option value="inactive">Inactivos</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative min-w-[200px]">
                    <Layers3 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5 pointer-events-none" />
                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className={selectorClase}
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
            </div>

            {totalFiltrados !== undefined && (
                <div className="ml-auto inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm whitespace-nowrap">
                    <span className="mr-2 flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                    {totalFiltrados} {totalFiltrados === 1 ? 'Examen localizado' : 'Exámenes localizados'}
                </div>
            )}
        </div>
    );
});

export default ExamFilters;
