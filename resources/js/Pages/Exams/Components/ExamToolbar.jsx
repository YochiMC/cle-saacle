import React from "react";
import ThemeButton from "@/Components/ui/ThemeButton";
import { Edit3 } from "lucide-react";

/**
 * Componente: ExamToolbar
 * 
 * Renderiza los controles de acción principales en la cabecera del dashboard de exámenes.
 */
const ExamToolbar = ({ 
    examen, 
    isEditingMode, 
    canEditQualifications, 
    requestCloseGroup, 
    setIsEditingMode 
}) => {
    // Si no tiene permisos o ya está editando en masa, no mostramos los botones
    if (!canEditQualifications || isEditingMode) return null;

    return (
        <div className="flex gap-2">
            {/* 1. Botón para Cerrar Examen Definitivamente */}
            {examen?.status !== 'completed' && (
                <ThemeButton
                    theme="danger"
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={requestCloseGroup}
                >
                    Cerrar Examen
                </ThemeButton>
            )}

            {/* 2. Botón para Activar Modo Captura (Bulk Update) */}
            <ThemeButton
                theme="institutional"
                icon={Edit3}
                size="sm"
                onClick={() => setIsEditingMode(true)}
            >
                Capturar Calificaciones
            </ThemeButton>
        </div>
    );
};

export default React.memo(ExamToolbar);
