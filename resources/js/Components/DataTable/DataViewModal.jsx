import React from "react";
import { X } from "lucide-react";

/**
 * Sub-componente genérico para mostrar un par "Llave - Valor" en detalles.
 * Etiqueta en mayúsculas grises uniformadas y contenido en fuente semibold.
 */
export const DataLabel = ({ label, value, fallback, pill = false, children }) => {
    const content = children ?? value;
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {label}
            </span>
            {content ? (
                pill ? (
                    <span className="inline-block w-fit text-[#1B396A] font-bold bg-blue-50 px-3 py-1 rounded-full text-sm">
                        {content}
                    </span>
                ) : (
                    <span className="text-sm text-gray-900 font-semibold">{content}</span>
                )
            ) : (
                <span className="text-sm italic text-gray-400">{fallback ?? "—"}</span>
            )}
        </div>
    );
};

/**
 * Wrapper de Vista de Detalles de Datos (Read-Only)
 * Mantiene la consistencia visual de todos los modales de lectura.
 *
 * @param {boolean} isOpen Controlador de apertura
 * @param {function} onClose Callback de cierre
 * @param {React.ReactNode} title Título o bloque JSX complejo para la cabecera
 * @param {React.ReactNode} children Render prop inyectado dentro de la cuadrícula
 */
export default function DataViewModal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Franja institucional ─────────────────────────── */}
                <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952] shrink-0" />

                {/* ── ENCABEZADO ─────────────────────────────────── */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4 shrink-0">
                    <div className="space-y-0.5 w-full">
                        {title}
                    </div>

                    {/* Botón Cerrar "X" */}
                    <button
                        onClick={onClose}
                        className="shrink-0 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Cerrar modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── CUERPO (Children Inyectado) ─────────────── */}
                <div className="px-6 py-5 overflow-y-auto flex-grow grid grid-cols-2 gap-x-8 gap-y-5">
                    {children}
                </div>

                {/* ── PIE ESTÁNDAR ───────────────────────────────── */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-[#1B396A] text-white text-sm font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
