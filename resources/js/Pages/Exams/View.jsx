import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/Resource/ResourceDashboard";
import { Head } from "@inertiajs/react";

// Hooks y Controladores
import useExamManager from "./Hooks/useExamManager";

// Constantes
import { VIEW_OPTIONS } from "./Constants/examConstants";

// Componentes Fragmentados
import ExamToolbar from "./Components/ExamToolbar";
import ExamBulkActionsBar from "./Components/ExamBulkActionsBar";
import ExamModals from "./Components/ExamModals";

/**
 * Vista Principal: Gestión de Examen (Dashboard).
 * 
 * Orquestador desacoplado que utiliza el patrón Headless Controller.
 * Maneja dinámicamente promedios numéricos o niveles MCER según el tipo de examen.
 */
export default function View({
    auth,
    examen,
    enrolledStudents = [],
    availableStudents = [],
    levelsTecnm = [],
}) {
    // 1. Invocación del Controlador Lógico (Custom Hook)
    const { 
        state, 
        handlers, 
        actions, 
        flashModal 
    } = useExamManager(examen, enrolledStudents);

    // 2. Lógica Visual de Filas
    const getRowClassName = (row) => {
        return row.original.is_left 
            ? "bg-slate-50/50 text-slate-400 opacity-75 hover:bg-slate-100 transition-colors" 
            : "text-slate-700 bg-white"; 
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Gestión de Examen: {examen?.name || `Examen #${examen?.id}`}
                </h2>
            }
        >
            <Head title={`Examen: ${examen?.name}`} />

            <div className="py-12 pb-32">
                {/* Dashboard Principal de Calificaciones Dinámicas */}
                <ResourceDashboard
                    title={`Calificaciones del Examen: ${examen?.name || "N/A"}`}
                    dataMap={{ alumnos: state.localData }}
                    viewOptions={VIEW_OPTIONS}
                    
                    // Configuración de mutaciones
                    deleteRoute={route("exams.unenroll-bulk", examen?.id)}
                    onDeleteRow={handlers.setItemToDelete}
                    
                    // Configuración de tabla dinámica extendida
                    editableColumns={state.editableColumns}
                    restrictedColumns={state.restrictedColumns}
                    selectOptions={{ 
                        "nivel_asignado": levelsTecnm,
                        "listening": ["A1", "A2", "B1", "B2", "C1", "C2"],
                        "reading": ["A1", "A2", "B1", "B2", "C1", "C2"],
                        "writing": ["A1", "A2", "B1", "B2", "C1", "C2"],
                        "speaking": ["A1", "A2", "B1", "B2", "C1", "C2"],
                    }}
                    editAllRows={state.isEditingMode}
                    hiddenColumns={{ exam_student_id: false }}
                    onCellChange={handlers.handleCellChange}
                    
                    // Edición Individual
                    editingRowId={state.editingRowId}
                    onEditRow={(item) => handlers.setEditingRowId(item.id)}
                    onSaveRow={(item) => handlers.setConfirmModal({ isOpen: true, type: 'row', itemData: item })}
                    onCancelRow={() => handlers.setEditingRowId(null)}
                    
                    // Inyección de Controles Fragmentados (Upper Toolbar)
                    buttonSpace={
                        <ExamToolbar 
                            examen={examen}
                            isEditingMode={state.isEditingMode}
                            canEditQualifications={state.canEditQualifications}
                            requestCloseGroup={() => handlers.setConfirmModal({ isOpen: true, type: 'close', itemData: null })}
                            setIsEditingMode={handlers.setIsEditingMode}
                        />
                    }
                    onNew={
                        state.canEditQualifications
                            ? () => handlers.setIsEnrollModalOpen(true)
                            : undefined
                    }
                    getRowClassName={getRowClassName}
                />
            </div>

            {/* Barra Inferior Flotante de Guardado Global */}
            <ExamBulkActionsBar 
                isEditingMode={state.isEditingMode}
                setIsEditingMode={handlers.setIsEditingMode}
                requestSaveGlobal={() => handlers.setConfirmModal({ isOpen: true, type: 'global', itemData: null })}
            />

            {/* Gestión Centralizada de Diálogos */}
            <ExamModals 
                isEnrollModalOpen={state.isEnrollModalOpen}
                setIsEnrollModalOpen={handlers.setIsEnrollModalOpen}
                availableStudents={availableStudents}
                handleEnroll={actions.handleEnroll}
                itemToDelete={state.itemToDelete}
                setItemToDelete={handlers.setItemToDelete}
                confirmDelete={actions.confirmDelete}
                confirmModal={state.confirmModal}
                setConfirmModal={handlers.setConfirmModal}
                confirmSave={actions.confirmSave}
                flashModal={flashModal}
                closeFlashModal={handlers.closeFlashModal}
            />
        </AuthenticatedLayout>
    );
}