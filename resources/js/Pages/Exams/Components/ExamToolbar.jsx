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
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            {/* 1. Botón para Cerrar Examen Definitivamente */}
            {examen?.status !== 'completed' && (
                <ThemeButton
                    theme="danger"
                    size="sm"
                    className="w-full whitespace-nowrap sm:w-auto"
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
                className="w-full sm:w-auto"
                onClick={() => setIsEditingMode(true)}
            >
                Capturar Calificaciones
            </ThemeButton>
        </div>
    );
};

export default React.memo(ExamToolbar);
