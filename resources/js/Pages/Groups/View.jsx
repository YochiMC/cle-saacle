import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/Resource/ResourceDashboard";
import { Head } from "@inertiajs/react";

// Hooks y Controladores
import useGroupManager from "./Hooks/useGroupManager";

// Constantes
import { VIEW_OPTIONS } from "./Constants/groupConstants";

// Componentes Fragmentados
import GroupToolbar from "./Components/GroupToolbar";
import GroupBulkActionsBar from "./Components/GroupBulkActionsBar";
import GroupModals from "./Components/GroupModals";

/**
 * Vista Principal: Gestión de Grupo (Dashboard).
 *
 * Orquestador de la vista de calificaciones e inscripción.
 * Aplica el patrón Headless Controller (useGroupManager) para separar la lógica de la UI.
 *
 * Contrato esperado desde backend:
 * - grupo: objeto del grupo activo.
 * - enrolledStudents: arreglo de alumnos inscritos con datos de calificación.
 * - availableStudents: candidatos para inscripción (vacío para rol student).
 */
export default function View({
    auth,
    grupo,
    enrolledStudents = [],
    availableStudents = [] // Ajustado según contrato del backend
}) {
    // 1. Invocación del Controlador Lógico (Custom Hook)
    const {
        state,
        handlers,
        actions,
        flashModal
    } = useGroupManager(grupo, enrolledStudents);

    // 2. Lógica Visual: Determinación de estilos de fila
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
                    Gestión de Grupo: {grupo?.name || "N/A"}
                </h2>
            }
        >
            <Head title={`Grupo: ${grupo?.name}`} />

            <div className="py-12 pb-32">
                {/* Dashboard Principal de Calificaciones */}
                <ResourceDashboard
                    title={`Calificaciones del Grupo: ${grupo?.name || "N/A"}`}
                    dataMap={{ alumnos: state.localData }}
                    viewOptions={VIEW_OPTIONS}

                    // Configuración de mutaciones
                    deleteRoute={route('groups.unenroll-bulk', grupo.id)}
                    onDeleteRow={handlers.requestDeleteRow}

                    // Configuración de tabla dinámica
                    editableColumns={state.editableColumns}
                    editAllRows={state.isEditingMode}
                    hiddenColumns={{ qualification_id: false }}
                    onCellChange={handlers.handleCellChange}

                    // Edición Individual de Filas
                    editingRowId={state.editingRowId}
                    onEditRow={(item) => handlers.setEditingRowId(item.id)}
                    onSaveRow={handlers.requestSaveRow}
                    onCancelRow={() => handlers.setEditingRowId(null)}

                    // Inyección de Controles Fragmentados
                    buttonSpace={
                        <GroupToolbar
                            grupo={grupo}
                            isEditingMode={state.isEditingMode}
                            canEditQualifications={state.canEditQualifications}
                            requestUpdateUnits={handlers.requestUpdateUnits}
                            requestCloseGroup={handlers.requestCloseGroup}
                            setIsEditingMode={handlers.setIsEditingMode}
                        />
                    }
                    onNew={state.canEnrollStudents ? () => handlers.setIsEnrollModalOpen(true) : undefined}
                    getRowClassName={getRowClassName}
                />
            </div>

            {/* Barra Inferior Flotante de Guardado Masivo */}
            <GroupBulkActionsBar
                isEditingMode={state.isEditingMode}
                setIsEditingMode={handlers.setIsEditingMode}
                requestSaveGlobal={handlers.requestSaveGlobal}
            />

            {/* Gestión de Modales y Confirmaciones */}
            <GroupModals
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
