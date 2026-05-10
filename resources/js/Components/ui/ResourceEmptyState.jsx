import React from "react";
import { PlusCircle } from "lucide-react";
import ThemeButton from "@/Components/ui/ThemeButton";

/**
 * ResourceEmptyState — Componente de presentación para estados sin datos.
 * 
 * Extraído de ResourceDashboard para cumplir con SRP.
 * Representa visualmente la ausencia de registros y ofrece la acción principal de creación.
 *
 * @param {Object} props
 * @param {string} props.label - Etiqueta de la vista actual (ej: "Carreras").
 * @param {Function} [props.onNew] - Callback para registrar un nuevo elemento.
 */
export default function ResourceEmptyState({ label, onNew }) {
    const displayLabel = label?.toLowerCase() || "esta vista";

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 mt-2">
            <h3 className="text-lg font-medium text-[#17365D] mb-2">
                No hay registros en {displayLabel}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">
                Aún no hay registros para mostrar en esta vista.
                {onNew
                    ? " Comienza agregando el primero para poder gestionar la información."
                    : ""}
            </p>
            {onNew && (
                <ThemeButton
                    theme="institutional"
                    icon={PlusCircle}
                    onClick={onNew}
                >
                    Registrar Nuevo
                </ThemeButton>
            )}
        </div>
    );
}
