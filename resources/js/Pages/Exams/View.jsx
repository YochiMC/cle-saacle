import React, { useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { Head } from "@inertiajs/react";
import { GRADES_HIDDEN_COLUMNS } from "@/Constants/tableColumns";

// Hooks y Controladores
import useExamManager from "./Hooks/useExamManager";

// Constantes
import { VIEW_OPTIONS } from "./Constants/examConstants";
import {
    BASE_STUDENT_KEYS,
    STATUS_KEYS,
    FOOTER_KEYS,
    IGNORED_DYNAMIC_KEYS,
} from "@/Constants/tableDictionary";

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
    isStudentEnrolled = false,
}) {
    // 1. Invocación del Controlador Lógico (Custom Hook)
    const { state, handlers, actions, flashModal } = useExamManager(
        examen,
        enrolledStudents,
        isStudentEnrolled,
    );

    // Filtrar niveles basándonos estrictamente en la base de datos
    const filteredLevels = useMemo(() => {
        return levelsTecnm
            .filter((level) => level?.program_type !== "Especial")
            .map((level) => level?.level_tecnm || level);
    }, [levelsTecnm]);

    // 2. Lógica Visual de Filas
    const getRowClassName = (row) => {
        return row.original.is_left
            ? "bg-slate-50/50 text-slate-400 opacity-75 hover:bg-slate-100 transition-colors"
            : "text-slate-700 bg-white";
    };

    // 3. Configuración de Columnas (Patrón Smart Component)
    const examColumnConfig = useMemo(
        () => ({
            baseKeys: BASE_STUDENT_KEYS,
            statusKeys: STATUS_KEYS,
            footerKeys: FOOTER_KEYS,
            ignoredKeys: IGNORED_DYNAMIC_KEYS,
            customOrder: (dynamicKeys) => {
                // 1. Identificar todas las posibles llaves dinámicas de los JSON de resultados
                const jsonResultKeys = [
                    "certified_level",
                    "nivel_certificado",
                    "score",
                    "speaking", // Convalidación
                    "is_curso_nivelacion",
                    "calificacion_curso_nivelacion",
                    "calificacion_examen",
                    "calificacion_final", // Planes Anteriores
                ];

                // 2. Separar las columnas regulares de las columnas de resultados JSON
                const standardKeys = dynamicKeys.filter(
                    (key) => !jsonResultKeys.includes(key),
                );
                const jsonKeysPresent = jsonResultKeys.filter((key) =>
                    dynamicKeys.includes(key),
                );

                // 3. Garantizar que las llaves del JSON siempre vayan al final (extremo derecho)
                return [...new Set([...standardKeys, ...jsonKeysPresent])];
            },
        }),
        [],
    );

    // 4. Determinación Dinámica de Columnas Obligatorias (forcedKeys)
    const forcedKeys = useMemo(() => {
        const type = examen?.exam_type?.value ?? examen?.exam_type;
        const base = ["num_control", "full_name"];

        switch (type) {
            case "Convalidación":
                return [...base, "certified_level", "score", "speaking"];
            case "Planes anteriores":
                return [
                    ...base,
                    "is_curso_nivelacion",
                    "calificacion_curso_nivelacion",
                    "calificacion_examen",
                    "calificacion_final",
                ];
            case "4 habilidades":
                return [
                    ...base,
                    "is_left",
                    "listening",
                    "reading",
                    "writing",
                    "speaking",
                    "promedio_habilidades",
                ];
            case "Ubicación":
                return [...base, "is_left", "nivel_asignado"];
            default:
                return base;
        }
    }, [examen]);

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
                    columnConfig={examColumnConfig}
                    forcedKeys={forcedKeys}
                    // Configuración de mutaciones
                    deleteRoute={
                        state.canDeleteEnrollments
                            ? route("exams.unenroll-bulk", examen?.id)
                            : undefined
                    }
                    onDeleteRow={
                        state.canDeleteEnrollments
                            ? handlers.setItemToDelete
                            : undefined
                    }
                    canPerformDelete={state.canDeleteEnrollments}
                    canPerformEdit={state.canEditQualifications}
                    // Configuración de tabla dinámica extendida
                    editableColumns={state.editableColumns}
                    restrictedColumns={state.restrictedColumns}
                    selectOptions={{
                        nivel_asignado: filteredLevels,
                    }}
                    editAllRows={state.isEditingMode}
                    hiddenColumns={GRADES_HIDDEN_COLUMNS}
                    onCellChange={handlers.handleCellChange}
                    // Edición Individual
                    editingRowId={state.editingRowId}
                    onEditRow={(item) => handlers.setEditingRowId(item.id)}
                    onSaveRow={(item) =>
                        handlers.setConfirmModal({
                            isOpen: true,
                            type: "row",
                            itemData: item,
                        })
                    }
                    onCancelRow={() => handlers.setEditingRowId(null)}
                    // Inyección de Controles Fragmentados (Upper Toolbar)
                    buttonSpace={
                        <ExamToolbar
                            examen={examen}
                            isEditingMode={state.isEditingMode}
                            canEditQualifications={state.canEditQualifications}
                            requestCloseGroup={() =>
                                handlers.setConfirmModal({
                                    isOpen: true,
                                    type: "close",
                                    itemData: null,
                                })
                            }
                            setIsEditingMode={handlers.setIsEditingMode}
                        />
                    }
                    onNew={
                        state.canEnrollStudents
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
                requestSaveGlobal={() =>
                    handlers.setConfirmModal({
                        isOpen: true,
                        type: "global",
                        itemData: null,
                    })
                }
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
