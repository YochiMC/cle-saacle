import React from "react";
import ThemeButton from "@/Components/ThemeButton";
import { X, CheckSquare } from "lucide-react";

/**
 * Componente genérico para accionar múltiples elementos seleccionados.
 * Maneja internamente su layout y estilos globales unificados limitándose a 
 * inyectar la botonera custom provista por el consumidor vía 'children' (SRP y OCP).
 *
 * @param {Object} props
 * @param {number} props.selectedCount - Cantidad de items seleccionados.
 * @param {function(): void} props.onClearSelection - Acción para deseleccionar todo.
 * @param {string} [props.selectedSingularLabel="Registro seleccionado"]
 * @param {string} [props.selectedPluralLabel="Registros seleccionados"]
 * @param {React.ReactNode} props.children - Las acciones específicas (Botones) a inyectar dentro del contenedor.
 */
export default function BulkActionBar({
    selectedCount = 0,
    onClearSelection,
    selectedSingularLabel = "Registro seleccionado",
    selectedPluralLabel = "Registros seleccionados",
    children,
}) {
    if (selectedCount === 0) return null;

    const selectedLabel =
        selectedCount === 1 ? selectedSingularLabel : selectedPluralLabel;

    return (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-md">
                    <CheckSquare size={20} className="text-blue-600" />
                </div>
                <div>
                    <span className="font-semibold text-blue-800">
                        {selectedCount}
                    </span>{" "}
                    <span className="text-blue-600/80">{selectedLabel}</span>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <ThemeButton
                    theme="secondary"
                    icon={X}
                    onClick={onClearSelection}
                    className="flex-1 sm:flex-none"
                >
                    Limpiar selección
                </ThemeButton>

                {/* Área para inyectar botones de acción específicos (cambiar estado, borrar, etc) */}
                {children}
            </div>
        </div>
    );
}
