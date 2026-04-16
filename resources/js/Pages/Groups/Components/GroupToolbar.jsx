import React from "react";
import ThemeButton from "@/Components/ui/ThemeButton";
import Dropdown from "@/Components/Dropdown";
import { Settings, Edit3 } from "lucide-react";
import { EVALUABLE_UNITS_RANGE } from "../Constants/groupConstants";

/**
 * Componente: GroupToolbar
 * 
 * Renderiza los controles de configuración y acciones principales del grupo.
 */
const GroupToolbar = ({ 
    grupo, 
    isEditingMode, 
    canEditQualifications, 
    requestUpdateUnits, 
    requestCloseGroup, 
    setIsEditingMode 
}) => {
    // Si no tiene permisos de edición o ya está en modo edición masiva, ocultamos el toolbar
    if (!canEditQualifications || isEditingMode) return null;

    return (
        <div className="flex items-center gap-2">
            {/* 1. Selector de Esquema de Unidades (Egresados tiene esquema fijo) */}
            {grupo?.type !== "Programa Egresados" && (
                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 bg-white text-slate-700 rounded-md hover:bg-slate-50 focus:ring-2 focus:ring-[#1B396A] transition-all font-medium text-sm shadow-sm">
                            <Settings size={16} />
                            <span className="hidden sm:inline">Esquema</span>
                        </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content align="right" width="48">
                        <div className="block px-4 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                            Unidades a Evaluar
                        </div>
                        {EVALUABLE_UNITS_RANGE.map(num => (
                            <Dropdown.Button
                                key={num}
                                onClick={() => requestUpdateUnits(num)}
                                className={grupo?.evaluable_units === num ? 'bg-slate-50 font-bold text-[#1B396A]' : ''}
                            >
                                {num} {num === 1 ? 'Unidad' : 'Unidades'}
                            </Dropdown.Button>
                        ))}
                    </Dropdown.Content>
                </Dropdown>
            )}

            {/* 2. Botón Cerrar Grupo */}
            {grupo?.status !== 'completed' && (
                <ThemeButton
                    theme="danger"
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={requestCloseGroup}
                >
                    Cerrar Grupo
                </ThemeButton>
            )}

            {/* 3. Botón Activar Modo Captura (Bulk Mode) */}
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

export default React.memo(GroupToolbar);
