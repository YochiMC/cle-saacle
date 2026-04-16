import React from "react";

/**
 * Componente: AccreditationFilters
 * 
 * Renderiza los selectores de filtrado para el dashboard de acreditaciones.
 */
const AccreditationFilters = ({ 
    statusFilter, 
    setStatusFilter, 
    typeFilter, 
    setTypeFilter, 
    accreditationTypeOptions = [] 
}) => {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estatus
                </label>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 min-w-[160px]"
                >
                    <option value="">Todos los estatus</option>
                    <option value="in_review">En Revisión</option>
                    <option value="accredited">Acreditado</option>
                    <option value="released">Liberado</option>
                </select>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de Acreditación
                </label>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 min-w-[200px]"
                >
                    <option value="">Todos los tipos</option>
                    {accreditationTypeOptions.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default React.memo(AccreditationFilters);
