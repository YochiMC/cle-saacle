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
                className="relative flex max-h-[90vh] w-full max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Franja institucional ─────────────────────────── */}
                <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952] shrink-0" />

                {/* ── ENCABEZADO ─────────────────────────────────── */}
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-4 pb-4 pt-4 sm:gap-4 sm:px-6 sm:pt-5">
                    <div className="w-full space-y-1 min-w-0">
                        {title}
                    </div>

                    {/* Botón Cerrar "X" */}
                    <button
                        onClick={onClose}
                        className="shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Cerrar modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── CUERPO (Children Inyectado) ─────────────── */}
                <div className="grid flex-grow grid-cols-1 gap-x-6 gap-y-4 overflow-y-auto px-4 py-4 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5 sm:px-6 sm:py-5">
                    {children}
                </div>

                {/* ── PIE ESTÁNDAR ───────────────────────────────── */}
                <div className="flex shrink-0 justify-end border-t border-gray-100 px-4 py-4 sm:px-6">
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
