import React, { memo } from "react";
import { X, Edit2, Trash2 } from "lucide-react";

const BulkActionBarExam = memo(({
    seleccionados = [],
    onClearSelection,
    onBulkStatus,
    onBulkDelete,
}) => {
    if (seleccionados.length === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-[#1B396A] text-white px-6 py-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-center gap-6 border border-[#142952]/50">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/30 font-bold text-blue-50">
                        {seleccionados.length}
                    </span>
                    <span className="font-semibold text-sm tracking-wide">
                        {seleccionados.length === 1 ? 'Examen seleccionado' : 'Exámenes seleccionados'}
                    </span>
                </div>

                <div className="hidden sm:block h-6 w-px bg-white/20"></div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onBulkStatus}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors text-sm"
                    >
                        <Edit2 size={16} />
                        <span className="hidden sm:inline">Cambiar Estado</span>
                    </button>
                    <button
                        onClick={onBulkDelete}
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

export default BulkActionBarExam;
