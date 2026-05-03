import { useState, useEffect, useMemo, useCallback } from "react";
import { router } from "@inertiajs/react";
import useFlashAlert from "@/Hooks/useFlashAlert";
import { usePermission } from "@/Utils/auth";
import { METADATA_KEYS } from "../Constants/groupConstants";
import {
    normalizeQualificationRow,
    calculateAverage,
    serializeQualification,
    buildUnitsBreakdown,
    getUnitKeys
} from "../Utils/groupLogic";

/**
 * Custom Hook: useGroupManager
 *
 * Controlador lógico para la vista de gestión de grupos.
 * Gestiona estados de captura de calificaciones, inscripciones y cierres.
 *
 * @param {object} grupo Grupo activo.
 * @param {Array|{data: Array}} enrolledStudents Dataset de alumnos inscritos.
 * @returns {{state: object, handlers: object, actions: object, flashModal: object}}
 */
export default function useGroupManager(grupo, enrolledStudents = []) {
    const { hasRole } = usePermission();
    const { flashModal, closeFlashModal } = useFlashAlert();

    // 1. Estados de Datos
    const normalizedEnrolledStudents = useMemo(() => {
        const data = Array.isArray(enrolledStudents)
            ? enrolledStudents
            : (enrolledStudents?.data || []);
        return data.map(row => normalizeQualificationRow(row, grupo));
    }, [enrolledStudents, grupo]);

    const [localData, setLocalData] = useState(normalizedEnrolledStudents);

    // Sincronización con el servidor
    useEffect(() => {
        setLocalData(normalizedEnrolledStudents);
    }, [normalizedEnrolledStudents]);

    // 2. Estados de UI / Edición
    const [editingRowId, setEditingRowId] = useState(null);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null, // 'global' | 'row' | 'close' | 'units'
        itemData: null,
    });

    // 3. Permisos derivados alineados con backend.
    // canEditQualifications controla captura/cierre academico.
    const canEditQualifications = useMemo(() =>
        hasRole("teacher") || hasRole("admin") || hasRole("coordinator"),
    [hasRole]);

    // canEnrollStudents controla la accion de alta en el modal de inscripcion.
    const canEnrollStudents = useMemo(() =>
        hasRole("admin") || hasRole("coordinator"),
    [hasRole]);

    const editableColumns = useMemo(() => {
        if (!canEditQualifications) return [];
        return [...getUnitKeys(grupo), "is_left"];
    }, [canEditQualifications, grupo]);

    // 4. Handlers de Interacción
    const handleCellChange = useCallback((fieldKey, rowId, newValue) => {
        setLocalData((prevData) =>
            prevData.map((row) => {
                if (row.id !== rowId) return row;

                const updatedRow = { ...row, [fieldKey]: newValue };

                if (!METADATA_KEYS.has(fieldKey)) {
                    updatedRow.final_average = calculateAverage(buildUnitsBreakdown(updatedRow));
                }

                return updatedRow;
            })
        );
    }, []);

    const requestDeleteRow = useCallback((item) => {
        setItemToDelete(item);
    }, []);

    const requestSaveRow = useCallback((item) => {
        setConfirmModal({ isOpen: true, type: 'row', itemData: item });
    }, []);

    const requestSaveGlobal = useCallback(() => {
        setConfirmModal({ isOpen: true, type: 'global', itemData: null });
    }, []);

    const requestCloseGroup = useCallback(() => {
        setConfirmModal({ isOpen: true, type: 'close', itemData: null });
    }, []);

    const requestUpdateUnits = useCallback((num) => {
        setConfirmModal({ isOpen: true, type: 'units', itemData: num });
    }, []);

    // 5. Acciones de Persistencia (Inertia)
    const confirmDelete = useCallback(() => {
        if (!itemToDelete) return;
        router.delete(route('groups.unenroll', [grupo.id, itemToDelete.id]), {
            preserveScroll: true,
            onSuccess: () => setItemToDelete(null)
        });
    }, [grupo.id, itemToDelete]);

    const handleEnroll = useCallback((selectedIds) => {
        router.post(route("groups.enroll", grupo.id), { student_ids: selectedIds }, {
            preserveScroll: true,
            onSuccess: () => setIsEnrollModalOpen(false),
        });
    }, [grupo.id]);

    const confirmSave = useCallback(() => {
        const resetModal = () => setConfirmModal({ isOpen: false, type: null, itemData: null });

        if (confirmModal.type === 'global') {
            router.patch(route('qualifications.bulk-update'), {
                qualifications: localData.map(serializeQualification)
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsEditingMode(false);
                    resetModal();
                },
                onError: resetModal,
            });
        } else if (confirmModal.type === 'row' && confirmModal.itemData) {
            const rowToSave = localData.find((row) => row.id === confirmModal.itemData.id);
            if (rowToSave && rowToSave.qualification_id) {
                router.patch(route('qualifications.update', rowToSave.qualification_id),
                    serializeQualification(rowToSave),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setEditingRowId(null);
                        resetModal();
                    },
                    onError: resetModal,
                });
            }
        } else if (confirmModal.type === 'close') {
            router.patch(route('groups.complete', grupo.id), {}, {
                preserveScroll: true,
                onSuccess: resetModal,
                onError: resetModal,
            });
        } else if (confirmModal.type === 'units') {
            router.patch(route('groups.update-units', grupo.id), {
                evaluable_units: Number(confirmModal.itemData)
            }, {
                preserveScroll: true,
                onSuccess: resetModal,
                onError: resetModal,
            });
        }
    }, [confirmModal, localData, grupo.id]);

    // 6. Retorno de Interfaz
    return {
        state: {
            localData,
            editingRowId,
            isEditingMode,
            isEnrollModalOpen,
            itemToDelete,
            confirmModal,
            editableColumns,
            canEditQualifications,
            canEnrollStudents,
        },
        handlers: {
            setEditingRowId,
            setIsEditingMode,
            setIsEnrollModalOpen,
            setItemToDelete,
            setConfirmModal,
            handleCellChange,
            requestDeleteRow,
            requestSaveRow,
            requestSaveGlobal,
            requestCloseGroup,
            requestUpdateUnits,
            closeFlashModal,
        },
        actions: {
            confirmDelete,
            confirmSave,
            handleEnroll,
        },
        flashModal,
    };
}
