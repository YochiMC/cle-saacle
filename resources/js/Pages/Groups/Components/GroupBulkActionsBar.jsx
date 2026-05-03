import React from "react";
import ThemeButton from "@/Components/ui/ThemeButton";
import { Save, X } from "lucide-react";

/**
 * Componente: GroupBulkActionsBar
 * 
 * Barra flotante inferior para el modo de captura masiva de calificaciones.
 */
const GroupBulkActionsBar = ({ 
    isEditingMode, 
    setIsEditingMode, 
    requestSaveGlobal 
}) => {
    if (!isEditingMode) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 p-6 shadow-[0_-6px_20px_rgba(23,54,93,0.12)] backdrop-blur-sm z-50">
            <div className="mx-auto flex w-full max-w-[96rem] items-center justify-end gap-4 sm:px-6 lg:px-8">
                <ThemeButton
                    theme="outline"
                    icon={X}
                    onClick={() => setIsEditingMode(false)}
                >
                    Cancelar
                </ThemeButton>
                <ThemeButton
                    theme="institutional"
                    icon={Save}
                    onClick={requestSaveGlobal}
                >
                    Guardar Cambios
                </ThemeButton>
            </div>
        </div>
    );
};

export default React.memo(GroupBulkActionsBar);
