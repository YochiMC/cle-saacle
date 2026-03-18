import React, { memo } from "react";
import { X, Edit2, Trash2 } from "lucide-react";
import { router } from "@inertiajs/react";

/**
 * Componente presentacional flotante que muestra las acciones en lote.
 * Con diseño UI Premium (fixed bottom, sombras fuertes) y atado estrictamente a sus callbacks.
 *
 * @param {Object} props
 * @param {Array<string|number>} props.seleccionados - IDs de los grupos seleccionados.
 * @param {function(): void} props.onClearSelection - Callback para limpiar la selección actual.
 * @param {function(): void} props.onBulkStatus - Callback para accionar el cambio de estado masivo.
 * @param {function(): void} props.onBulkDelete - Callback para accionar la eliminación masiva.
 */
const BulkActionBar = memo(({
    seleccionados = [],
    onClearSelection,
    statuses = [],
}) => {
    if (seleccionados.length === 0) return null;

    const handleBulkDelete = () => {
        if (confirm("¿Estás seguro de que deseas eliminar los grupos seleccionados? Esta acción es irreversible.")) {
            router.delete('/groups/bulk', {
                data: { ids: seleccionados },
                onSuccess: () => onClearSelection()
            });
        }
    };

    const handleBulkStatus = (e) => {
        const newStatus = e.target.value;
        if (!newStatus) return;
        router.post('/groups/bulk-status', {
            ids: seleccionados,
            new_status: newStatus
        }, {
            onSuccess: () => onClearSelection()
        });
    };

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-[#1B396A] text-white px-6 py-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-center gap-6 border border-[#142952]/50">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/30 font-bold text-blue-50">
                        {seleccionados.length}
                    </span>
                    <span className="font-semibold text-sm tracking-wide">
                        {seleccionados.length === 1 ? 'Grupo seleccionado' : 'Grupos seleccionados'}
                    </span>
                </div>

                <div className="hidden sm:block h-6 w-px bg-white/20"></div>

                <div className="flex items-center gap-3">
                    <div className="relative flex items-center bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm pl-3 overflow-hidden cursor-pointer">
                        <Edit2 size={16} className="pointer-events-none" />
                        <select
                            onChange={handleBulkStatus}
                            value=""
                            className="bg-transparent text-white font-medium py-2 pl-2 pr-6 border-none outline-none focus:ring-0 appearance-none cursor-pointer"
                        >
                            <option value="" disabled className="text-gray-900">Cambiar Estado</option>
                            {statuses.map(s => (
                                <option key={s.value} value={s.value} className="text-gray-900">
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-sm transition-colors text-sm"
                    >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Eliminar</span>
                    </button>
                    <div className="h-6 w-px bg-white/20 mx-1"></div>
                    <button
                        onClick={onClearSelection}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Cancelar selección"
                        title="Cancelar selección"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
});

export default BulkActionBar;
