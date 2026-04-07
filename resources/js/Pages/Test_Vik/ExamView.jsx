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
 * Reconstruye el contrato que espera BulkUpdateExamQualificationsRequest.
 *
 * @param {Object} row - Fila aplanada (con campos de unidades individuales).
 * @param {string[]} unitKeys - Claves de las unidades de este examen.
 * @returns {Object} Item del array qualifications para el request.
 */
const serializeQualification = (row, unitKeys) => ({
    exam_student_id: row.exam_student_id,
    units_breakdown: buildUnitsBreakdown(row, unitKeys),
    final_average: row.final_average,
});

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

    const editableColumns = canEditQualifications ? unitKeys : [];

    // ── Handlers de Edición Individual ────────────────────────────────────────────
    const handleSaveRow = (item) => {
        const rowToSave = localData.find((row) => row.id === item.id);
        const examStudentId = rowToSave?.exam_student_id;

        if (rowToSave && examStudentId) {
            router.patch(
                route("exams.qualifications.update", examen.id),
                {
                    // Reusamos updatePivot para edición individual:
                    // enviamos un array de 1 elemento con el formato de bulkUpdate
                    qualifications: [serializeQualification(rowToSave, unitKeys)],
                },
                {
                    preserveScroll: true,
                    onSuccess: () => setEditingRowId(null),
                    onError: (errors) => console.error("Error al guardar fila:", errors),
                },
            );
        } else {
            console.warn("No se encontró exam_student_id para la fila.");
            setEditingRowId(null);
        }
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

    // ── Handler de Cambio de Celda ────────────────────────────────────────────────
    const handleCellChange = (fieldKey, rowId, newValue) => {
        setLocalData((prevData) =>
            prevData.map((row) => {
                if (row.id !== rowId) return row;

                const updatedRow = { ...row, [fieldKey]: newValue };

                // Solo recalculamos el promedio si el campo modificado es numérico
                // (no texto libre ni selector).
                const isNumericField = !isNaN(Number(newValue)) && newValue !== "";
                if (isNumericField) {
                    const currentUnitKeys = getUnitKeysFromRows([updatedRow]);
                    const breakdown = buildUnitsBreakdown(updatedRow, currentUnitKeys);
                    updatedRow.final_average = calculateAverage(breakdown);
                }

                return updatedRow;
            }),
        );
    };

    // ── Handler de Guardado Global ────────────────────────────────────────────────
    const handleSaveGlobal = () => {
        router.patch(
            route("exams.qualifications.bulk-update", examen.id),
            { qualifications: localData.map((row) => serializeQualification(row, unitKeys)) },
            {
                preserveScroll: true,
                onSuccess: () => setIsEditingMode(false),
                onError: (errors) => console.error("Errores al guardar:", errors),
            },
        );
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
                        selectOptions={{ "nivel_asignado": levelsTecnm }}
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
        </>
    );
}
