import React from "react";
import ThemeButton from "@/Components/ui/ThemeButton";
import Dropdown from "@/Components/ui/Dropdown";
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
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            {/* 1. Selector de Esquema de Unidades (Especial tiene esquema fijo) */}
            {grupo?.type !== "Programa Especial" && (
                    <Dropdown>
                    <Dropdown.Trigger>
                        <button className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:ring-2 focus:ring-[#1B396A] sm:w-auto">
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
                    className="w-full whitespace-nowrap sm:w-auto"
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
                className="w-full sm:w-auto"
                onClick={() => setIsEditingMode(true)}
            >
                Capturar Calificaciones
            </ThemeButton>
        </div>
    );
};

export default React.memo(GroupToolbar);

