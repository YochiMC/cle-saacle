import { useState, useEffect, useMemo, useCallback } from "react";
import { router } from "@inertiajs/react";
import useFlashAlert from "@/Hooks/useFlashAlert";
import { usePermission } from "@/Utils/auth";
import {
    normalizeQualificationRow,
    getUnitKeysFromRows,
    calculateAverage,
    calculateMcerOutcome,
    getRestrictedColumns,
    serializeQualification
} from "../Utils/examLogic";

/**
 * Custom Hook: useExamManager
 *
 * Controlador lógico para la vista de gestión de exámenes.
 * Implementa soporte dinámico para promedios numéricos y niveles MCER.
 */
export default function useExamManager(examen, enrolledStudents = [], isStudentEnrolled = false) {
    const { hasRole } = usePermission();
    const { flashModal, closeFlashModal } = useFlashAlert();

    // 1. Estados de Datos
    const normalizedData = useMemo(() => {
        const data = Array.isArray(enrolledStudents)
            ? enrolledStudents
            : (enrolledStudents?.data || []);
        return data.map(normalizeQualificationRow);
    }, [enrolledStudents]);

    const [localData, setLocalData] = useState(normalizedData);

    useEffect(() => {
        setLocalData(normalizedData);
    }, [normalizedData]);

    // 2. Estados de UI
    const [editingRowId, setEditingRowId] = useState(null);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null, // 'global' | 'row' | 'close'
        itemData: null
    });

    // 3. Lógica Derivada
    const canEditQualifications = useMemo(() => {
        if (hasRole("admin") || hasRole("coordinator")) return true;
        if (hasRole("teacher")) {
            const status = examen?.status?.value ?? examen?.status;
            return status === "grading";
        }
        return false;
    }, [hasRole, examen?.status]);

    const canEnrollStudents = useMemo(() => 
        (hasRole("admin") || hasRole("coordinator")) && !isStudentEnrolled,
    [hasRole, isStudentEnrolled]);

    // canDeleteEnrollments controla la acción de baja: admin o coordinator
    const canDeleteEnrollments = useMemo(() =>
        hasRole("admin") || hasRole("coordinator"),
    [hasRole]);

    const unitKeys = useMemo(() => 
        getUnitKeysFromRows(normalizedData),
    [normalizedData]);

    const restrictedColumns = useMemo(() =>
        getRestrictedColumns(examen?.exam_type),
    [examen]);

    const editableColumns = useMemo(() => {
        if (!canEditQualifications) return [];
        // 'promedio_habilidades' es un campo de solo lectura calculado en cliente/server
        const columns = unitKeys.filter((k) => {
            if (k === "promedio_habilidades") return false;
            // En Planes anteriores la calificación final se calcula automáticamente.
            if (examen?.exam_type === "Planes anteriores" && k === "calificacion_final") return false;
            return true;
        });
        return ["attempt", "is_left", ...columns];
    }, [canEditQualifications, unitKeys, examen?.exam_type]);

    // 4. Handlers de Interacción
    const handleCellChange = useCallback((fieldKey, rowId, newValue) => {
        setLocalData((prevData) =>
            prevData.map((row) => {
                if (row.id !== rowId) return row;

                // Blindaje: evitar edición manual de calificación final en Planes anteriores.
                if (examen?.exam_type === "Planes anteriores" && fieldKey === "calificacion_final") {
                    return row;
                }

                const updatedRow = { ...row, [fieldKey]: newValue };

                // Regla especial: Planes anteriores (Auto-cálculo de calificación final)
                if (examen?.exam_type === "Planes anteriores") {
                    updatedRow.calificacion_final = updatedRow.is_curso_nivelacion
                        ? Number(updatedRow.calificacion_curso_nivelacion || 0)
                        : Number(updatedRow.calificacion_examen || 0);

                    // Sincronizar con el promedio general del sistema
                    updatedRow.final_average = updatedRow.calificacion_final;
                }

                if (examen?.exam_type === "4 habilidades") {
                    updatedRow.promedio_habilidades = calculateMcerOutcome(updatedRow);
                    updatedRow.final_average = updatedRow.promedio_habilidades === "NA" ? null : updatedRow.promedio_habilidades;
                } else if (!restrictedColumns.includes("final_average") && examen?.exam_type !== "Planes anteriores") {
                    // Recalcular promedio numérico si no está oculto y no es el caso especial arriba
                    const isNumeric = !isNaN(Number(newValue)) && newValue !== "";
                    if (isNumeric) {
                        updatedRow.final_average = calculateAverage(updatedRow);
                    }
                }

                return updatedRow;
            })
        );
    }, [examen, restrictedColumns]);

    // 5. Acciones de Persistencia (Inertia)
    const handleEnroll = useCallback((selectedIds) => {
        router.post(route("exams.enroll", examen.id), { student_ids: selectedIds }, {
            preserveScroll: true,
            onSuccess: () => setIsEnrollModalOpen(false),
        });
    }, [examen.id]);

    const confirmDelete = useCallback(() => {
        if (!itemToDelete) return;
        router.delete(route("exams.unenroll", [examen.id, itemToDelete.id]), {
            preserveScroll: true,
            onSuccess: () => setItemToDelete(null),
        });
    }, [examen.id, itemToDelete]);

    const confirmSave = useCallback(() => {
        const reset = () => setConfirmModal({ isOpen: false, type: null, itemData: null });

        if (confirmModal.type === 'global') {
            router.patch(route("exams.qualifications.bulk-update", examen.id),
                { qualifications: localData.map(serializeQualification) },
            {
                preserveScroll: true,
                onSuccess: () => { setIsEditingMode(false); reset(); },
                onError: (errors) => { console.error("Bulk Update Error:", errors); reset(); },
            });
        } else if (confirmModal.type === 'row' && confirmModal.itemData) {
            const rowToSave = localData.find((row) => row.id === confirmModal.itemData.id);
            if (rowToSave) {
                router.patch(route("exams.qualifications.update", [examen.id, rowToSave.id]),
                    serializeQualification(rowToSave),
                {
                    preserveScroll: true,
                    onSuccess: () => { setEditingRowId(null); reset(); },
                    onError: (errors) => { console.error("Row Update Error:", errors); reset(); },
                });
            }
        } else if (confirmModal.type === 'close') {
            router.patch(route('exams.complete', examen.id), {}, {
                preserveScroll: true,
                onSuccess: reset,
                onError: reset,
            });
        }
    }, [examen.id, localData, confirmModal]);

    return {
        state: {
            localData,
            editingRowId,
            isEditingMode,
            isEnrollModalOpen,
            itemToDelete,
            confirmModal,
            unitKeys,
            restrictedColumns,
            editableColumns,
            canEditQualifications,
            canEnrollStudents,
            canDeleteEnrollments,
        },
        handlers: {
            setEditingRowId,
            setIsEditingMode,
            setIsEnrollModalOpen,
            setItemToDelete,
            setConfirmModal,
            handleCellChange,
            closeFlashModal,
        },
        actions: {
            handleEnroll,
            confirmDelete,
            confirmSave,
        },
        flashModal,
    };
}
