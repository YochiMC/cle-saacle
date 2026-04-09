import React, { useState, useEffect, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { usePermission } from "@/Utils/auth";
import ThemeButton from "@/Components/ThemeButton";
import { X, Save, Edit3 } from "lucide-react";
import { router } from "@inertiajs/react";
import EnrollStudentModal from "@/Pages/Test_MK2/FormModals/EnrollStudentModal";
import ConfirmModal from "@/Components/ConfirmModal";
import ModalAlert from "@/Components/ui/ModalAlert";
import useFlashAlert from "@/Hooks/useFlashAlert";

// ── Patrón de claves de unidades (todo lo que NO es metadata del alumno) ──────
const UNIT_KEY_PATTERN = /^(?!id$|full_name$|matricula$|gender$|semester$|exam_student_id$|final_average$).+/i;

/**
 * Aplana el units_breakdown (objeto JSON) en columnas planas para la tabla dinámica.
 * Los campos del alumno y metadatos quedan separados del desglose de calificaciones.
 *
 * @param {Object} row - Fila del Resource (con units_breakdown como objeto).
 * @returns {Object} Fila aplanada lista para la tabla.
 */
const normalizeQualificationRow = (row) => {
    const unitsBreakdown =
        row?.units_breakdown && typeof row.units_breakdown === "object" && !Array.isArray(row.units_breakdown)
            ? row.units_breakdown
            : {};

    const { units_breakdown, ...rest } = row;

    return {
        ...rest,
        ...unitsBreakdown,
    };
};

/**
 * Extrae las claves de calificacion del primer registro normalizado.
 * Excluye los campos de metadata del alumno y devuelve solo las claves del JSON.
 *
 * @param {Array} rows - Filas normalizadas.
 * @returns {string[]} Claves de unidades ordenadas.
 */
const getUnitKeysFromRows = (rows) => {
    const METADATA_KEYS = new Set([
        "id", "full_name", "matricula", "gender", "semester",
        "exam_student_id", "final_average",
    ]);

    return Array.from(
        new Set(
            rows.flatMap((row) =>
                Object.keys(row).filter((key) => !METADATA_KEYS.has(key)),
            ),
        ),
    );
};

/**
 * Reconstruye el objeto units_breakdown a partir de una fila aplanada.
 * Excluye los campos de metadata del alumno.
 *
 * @param {Object} row - Fila aplanada con campos de calificación.
 * @returns {Object} Objeto units_breakdown para enviar al backend.
 */
const buildUnitsBreakdown = (row, unitKeys) =>
    Object.fromEntries(unitKeys.map((key) => [key, row[key] ?? ""]));

/**
 * Calcula el promedio de las unidades numéricas.
 * Las claves con valores string (texto/selector) no se incluyen en el promedio.
 *
 * @param {Object} unitsBreakdown
 * @returns {number} Promedio redondeado (0 si no hay valores numéricos).
 */
const calculateAverage = (unitsBreakdown) => {
    const values = Object.values(unitsBreakdown)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value !== 0 || typeof value === "number");

    const numericValues = Object.entries(unitsBreakdown)
        .filter(([, v]) => typeof v === "number" || (typeof v === "string" && v !== "" && !isNaN(Number(v))))
        .map(([, v]) => Number(v))
        .filter(Number.isFinite);

    if (numericValues.length === 0) return 0;

    return Math.round(numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length);
};

/**
 * Serializa una fila para enviarla al backend.
 * Reconstruye el contrato que espera el backend, separando campos base de las unidades.
 *
 * @param {Object} row - Fila aplanada (con campos de unidades individuales).
 * @returns {Object} Item del array qualifications para el request.
 */
const serializeQualification = (row) => {
    // Extraemos los campos que NO pertenecen al JSON dinámico
    const { id, full_name, matricula, exam_student_id, final_average, qualification_id, gender, semester, ...dynamicUnits } = row;
    
    return {
        student_id: id,
        final_average: final_average || 0,
        units_breakdown: dynamicUnits // Todo el resto se va al JSON (ej. reading, is_left, nivel_asignado)
    };
};

/**
 * Vista de Gestión de Examen (Dashboard).
 *
 * Implementa la misma arquitectura dinámica de columnas JSON que GroupView.
 * La estructura de las columnas se adapta dinámicamente al ExamType, ya que
 * el backend inicializa units_breakdown según la lógica de negocio de ExamType.
 *
 * - Edición Global: Botón "Capturar Calificaciones" activa modo edición masiva.
 * - Edición Individual: Cada fila puede editarse de forma independiente.
 * - Recálculo en Tiempo Real: Cada cambio en una unidad numérica recalcula final_average.
 * - Soporte para Checkbox, Texto, Número y Selector (nivel_asignado).
 *
 * @param {Object} props
 * @param {Object} props.auth - Objeto de autenticación de Inertia.
 * @param {Object} props.examen - El objeto del examen cargado.
 * @param {Array}  props.enrolledStudents - Alumnos serializados por StudentExamQualificationResource.
 * @param {Array}  props.availableStudents - Alumnos disponibles para inscripción.
 */
export default function ExamView({
    auth,
    examen,
    enrolledStudents = [],
    availableStudents = [],
    levelsTecnm = [],
}) {
    const { hasRole } = usePermission();

    // Normalización defensiva — Inertia puede enviar ResourceCollection como { data: [...] }
    const normalizedEnrolledStudents = Array.isArray(enrolledStudents)
        ? enrolledStudents
        : Array.isArray(enrolledStudents?.data)
          ? enrolledStudents.data
          : [];

    // Aplanamos units_breakdown en columnas planas para la tabla dinámica
    const normalizedQualificationRows = useMemo(
        () => normalizedEnrolledStudents.map(normalizeQualificationRow),
        [normalizedEnrolledStudents],
    );

    // Estado local de la tabla (editable en cliente, persiste al guardar)
    const [localData, setLocalData] = useState(normalizedQualificationRows);

    // Sincronizar cuando llegan datos actualizados desde el servidor
    useEffect(() => {
        setLocalData(normalizedQualificationRows);
    }, [normalizedQualificationRows]);

    // ── Control de acceso ─────────────────────────────────────────────────────────
    const canEditQualifications = hasRole("teacher") || hasRole("admin") || hasRole("coordinator");

    // ── Estados de Edición ────────────────────────────────────────────────────────
    const [editingRowId, setEditingRowId] = useState(null);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const { flashModal, closeFlashModal } = useFlashAlert();

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null, // 'global' | 'row'
        itemData: null
    });

    // ── Columnas dinámicas ────────────────────────────────────────────────────────
    // Las claves de unidades se detectan automáticamente desde los datos del backend.
    // Esto hace que la tabla se adapte al ExamType sin cambios en el frontend.
    const unitKeys = useMemo(
        () => getUnitKeysFromRows(normalizedQualificationRows),
        [normalizedQualificationRows],
    );

    // Ocultar `final_average` globalmente en tipos de examen que no usan promedio.
    // Ej: 4 habilidades, Convalidación (solo texto), Ubicación (select), Planes anteriores (usa calificacion_final).
    const restrictedColumns = [];
    const examType = examen?.exam_type;
    if (
        examType === "4 habilidades" ||
        examType === "Convalidación" ||
        examType === "Ubicación" ||
        examType === "Planes anteriores"
    ) {
        restrictedColumns.push("final_average");
    }

    const editableColumns = canEditQualifications 
        ? unitKeys.filter(k => k !== "promedio_habilidades") 
        : [];

    // ── Handlers de Edición Individual ────────────────────────────────────────────
    const handleSaveRow = (item) => {
        setConfirmModal({ isOpen: true, type: 'row', itemData: item });
    };

    const handleCancelRow = () => setEditingRowId(null);

    const handleDeleteRow = (item) => setItemToDelete(item);

    const confirmDelete = () => {
        if (!itemToDelete) return;
        router.delete(route("exams.unenroll", [examen.id, itemToDelete.id]), {
            preserveScroll: true,
            onSuccess: () => setItemToDelete(null),
        });
    };

    const getRowClassName = (row) => {
        // Si el alumno es baja, se atenúa visualmente (Ghost effect) en lugar de oscurecerse agresivamente.
        return row.original.is_left 
            ? "bg-slate-50/50 text-slate-400 opacity-75 hover:bg-slate-100 transition-colors" 
            : "text-slate-700 bg-white"; 
    };

    // ── Handler de Cambio de Celda ────────────────────────────────────────────────
    const handleCellChange = (fieldKey, rowId, newValue) => {
        setLocalData((prevData) =>
            prevData.map((row) => {
                if (row.id !== rowId) return row;

                const updatedRow = { ...row, [fieldKey]: newValue };

                if (examType === "4 habilidades") {
                    // Pesos para calcular el mínimo de los niveles
                    const mcerWeights = { "A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6 };
                    const skills = ["listening", "reading", "writing", "speaking"];
                    
                    let lowestWeight = Infinity;
                    let allSkillsValid = true;

                    for (const skill of skills) {
                        const val = updatedRow[skill]?.toString().toUpperCase().trim();
                        // Si falta el valor, no es válido
                        if (!val || !(val in mcerWeights)) {
                            allSkillsValid = false;
                            break;
                        }
                        
                        const weight = mcerWeights[val];
                        if (weight < lowestWeight) {
                            lowestWeight = weight;
                        }
                        
                        // Si cualquier habilidad es menor a B1 (peso 3), es NA
                        if (weight < 3) {
                            allSkillsValid = false;
                            break;
                        }
                    }

                    if (!allSkillsValid || lowestWeight < 3) {
                        updatedRow.promedio_habilidades = "NA";
                    } else {
                        // Buscar el nombre del nivel a partir del peso más bajo
                        const lowestKey = Object.keys(mcerWeights).find(k => mcerWeights[k] === lowestWeight);
                        updatedRow.promedio_habilidades = lowestKey || "NA";
                    }
                } else {
                    // Original logic for numeric average
                    const isNumericField = !isNaN(Number(newValue)) && newValue !== "";
                    // Solo recalcular final_average si la tabla espera usarlo
                    if (isNumericField && !restrictedColumns.includes("final_average")) {
                        const currentUnitKeys = getUnitKeysFromRows([updatedRow]);
                        const breakdown = buildUnitsBreakdown(updatedRow, currentUnitKeys);
                        updatedRow.final_average = calculateAverage(breakdown);
                    }
                }

                return updatedRow;
            }),
        );
    };

    // ── Handler de Guardado Global ────────────────────────────────────────────────
    const handleSaveGlobal = () => {
        setConfirmModal({ isOpen: true, type: 'global', itemData: null });
    };

    // ── Ejecutor Maestro (Llamado por el modal) ───────────────────────────────────
    const confirmSave = () => {
        if (confirmModal.type === 'global') {
            const serializedData = localData.map(serializeQualification);
            
            router.patch(
                route("exams.qualifications.bulk-update", examen.id),
                { qualifications: serializedData },
                {
                    preserveScroll: true,
                    onSuccess: () => { 
                        setIsEditingMode(false); 
                        setConfirmModal({ isOpen: false, type: null, itemData: null }); 
                    },
                    onError: (errors) => console.error("Errores al guardar", errors),
                }
            );
        } else if (confirmModal.type === 'row' && confirmModal.itemData) {
            const rowToSave = localData.find((row) => row.id === confirmModal.itemData.id);
            if (!rowToSave) return;

            const serializedRow = serializeQualification(rowToSave);

            router.patch(
                route("exams.qualifications.update", [examen.id, confirmModal.itemData.id]),
                serializedRow,
                {
                    preserveScroll: true,
                    onSuccess: () => { 
                        setEditingRowId(null); 
                        setConfirmModal({ isOpen: false, type: null, itemData: null }); 
                    },
                    onError: (errors) => console.error("Error al guardar fila:", errors),
                }
            );
        }
    };

    // ── Handler de Inscripción ────────────────────────────────────────────────────
    const handleEnroll = (selectedIds) => {
        router.post(
            route("exams.enroll", examen.id),
            { student_ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => setIsEnrollModalOpen(false),
            },
        );
    };

    // ── Configuración del Dashboard ───────────────────────────────────────────────
    const viewOptions = [{ value: "alumnos", label: "Alumnos Inscritos" }];

    const dataMap = useMemo(
        () => ({ alumnos: localData }),
        [localData],
    );

    return (
        <>
            <AuthenticatedLayout
                user={auth?.user}
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Gestión de Examen: {examen?.name || `Examen #${examen?.id}`}
                    </h2>
                }
            >
                <div className="py-12 pb-32">
                    {/* ── Dashboard Principal ────────────────────────────────────────────── */}
                    <ResourceDashboard
                        title={`Calificaciones del Examen: ${examen?.name || "N/A"}`}
                        dataMap={dataMap}
                        viewOptions={viewOptions}
                        deleteRoute={route("exams.unenroll-bulk", examen?.id)}
                        onDeleteRow={handleDeleteRow}
                        editableColumns={editableColumns}
                        restrictedColumns={restrictedColumns}
                        selectOptions={{ 
                            "nivel_asignado": levelsTecnm,
                            "listening": ["A1", "A2", "B1", "B2", "C1", "C2"],
                            "reading": ["A1", "A2", "B1", "B2", "C1", "C2"],
                            "writing": ["A1", "A2", "B1", "B2", "C1", "C2"],
                            "speaking": ["A1", "A2", "B1", "B2", "C1", "C2"],
                        }}
                        editAllRows={isEditingMode}
                        hiddenColumns={{ exam_student_id: false }}
                        onCellChange={handleCellChange}
                        editingRowId={editingRowId}
                        onEditRow={(item) => setEditingRowId(item.id)}
                        onSaveRow={handleSaveRow}
                        onCancelRow={handleCancelRow}
                        buttonSpace={
                            canEditQualifications && !isEditingMode ? (
                                <ThemeButton
                                    theme="institutional"
                                    icon={Edit3}
                                    size="sm"
                                    onClick={() => setIsEditingMode(true)}
                                >
                                    Capturar Calificaciones
                                </ThemeButton>
                            ) : null
                        }
                        onNew={
                            canEditQualifications
                                ? () => setIsEnrollModalOpen(true)
                                : undefined
                        }
                        getRowClassName={getRowClassName}
                    />
                </div>

                {/* ── Barra Inferior: Panel de Guardado Global ──────────────────────────── */}
                {isEditingMode && canEditQualifications && (
                    <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 p-6 shadow-[0_-6px_20px_rgba(23,54,93,0.12)] backdrop-blur-sm">
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
                                onClick={handleSaveGlobal}
                            >
                                Guardar Cambios
                            </ThemeButton>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>

            <EnrollStudentModal
                show={isEnrollModalOpen}
                onClose={() => setIsEnrollModalOpen(false)}
                availableStudents={availableStudents}
                onEnroll={handleEnroll}
            />

            <ConfirmModal
                isOpen={itemToDelete !== null}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Dar de baja alumno"
                message={`¿Estás seguro de que deseas dar de baja a ${itemToDelete?.full_name || "este alumno"} del examen?`}
                confirmText="Sí, dar de baja"
                variant="warning"
            />

            <ModalAlert
                isOpen={flashModal.isOpen}
                onClose={closeFlashModal}
                type={flashModal.type}
                title={flashModal.title}
                message={flashModal.message}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: null, itemData: null })}
                onConfirm={confirmSave}
                title={confirmModal.type === 'global' ? "Confirmar guardado masivo" : "Guardar calificación"}
                message={
                    confirmModal.type === 'global' 
                    ? "¿Deseas guardar las calificaciones de todos los alumnos?"
                    : "¿Estás seguro de guardar la calificación de este alumno?"
                }
                confirmText="Sí, guardar"
                cancelText="Cancelar"
                variant="warning"
            />
        </>
    );
}
