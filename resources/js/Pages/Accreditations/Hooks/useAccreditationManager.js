import { useState, useMemo, useCallback } from "react";
import { router } from "@inertiajs/react";
import useFlashAlert from "@/Hooks/useFlashAlert";
import { STATUS_SELECT_OPTIONS } from "../Constants/accreditationConstants";

/**
 * Custom Hook: Headless Controller para la gestión de Acreditaciones.
 * 
 * Centraliza la lógica de filtrado, estados de UI y mutaciones vía Inertia.
 */
export default function useAccreditationManager(candidates) {
    // 1. Estados de Interfaz
    const { flashModal, closeFlashModal, showFlash } = useFlashAlert();
    const [itemToSuspend, setItemToSuspend] = useState(null);
    const [itemToChange, setItemToChange] = useState(null);
    const [editingRowId, setEditingRowId] = useState(null);

    // 2. Estados de Filtrado
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    // 3. Lógica de Filtrado Derivada
    const filteredCandidates = useMemo(() => {
        return candidates.filter((item) => {
            const matchesStatus = statusFilter === "" || item.status === statusFilter;
            const matchesType = typeFilter === "" || 
                (item?.achieved_by && item.achieved_by.toLowerCase() === typeFilter.toLowerCase());
            return matchesStatus && matchesType;
        });
    }, [candidates, statusFilter, typeFilter]);

    // 4. Handlers de Selección y Edición
    const handleEditRow = useCallback((item) => {
        setEditingRowId(item.id);
    }, []);

    const handleCancelRowEdit = useCallback(() => {
        setEditingRowId(null);
    }, []);

    const requestSuspendRow = useCallback((item) => {
        setItemToSuspend(item);
    }, []);

    // Intercepta cambios en celdas (status) para mostrar confirmación
    const handleCellChange = useCallback((fieldKey, rowId, value) => {
        if (fieldKey === "status") {
            const itemToEdit = candidates.find((c) => c.id === rowId);
            setItemToChange({
                rowId,
                newValue: value,
                targetName: itemToEdit?.full_name || "este alumno",
                newLabel: STATUS_SELECT_OPTIONS.find((opt) => opt.value === value)?.label || value,
            });
        }
    }, [candidates]);

    // 5. Handlers de Persistencia (Inertia API)
    const handleConfirmChange = useCallback(() => {
        if (!itemToChange) return;

        const { rowId, newValue } = itemToChange;
        setItemToChange(null);

        router.patch(
            route("accreditations.update-status", rowId),
            { status: newValue },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    showFlash("success", "El estatus de acreditación se ha actualizado.");
                    setEditingRowId(null);
                },
                onError: () => {
                    showFlash("error", "Ha ocurrido un error al actualizar el estatus.");
                },
            }
        );
    }, [itemToChange, showFlash]);

    const handleConfirmSuspend = useCallback(() => {
        if (!itemToSuspend) return;

        const target = itemToSuspend;
        setItemToSuspend(null);

        router.patch(
            route("accreditations.update-status", target.id),
            { status: "suspended" },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    showFlash("success", "Alumno actualizado a estatus Suspendido.");
                },
                onError: () => {
                    showFlash("error", "No se pudo actualizar el estatus del alumno.");
                },
            }
        );
    }, [itemToSuspend, showFlash]);

    // 6. Retorno de la Interfaz del Hook
    return {
        state: {
            editingRowId,
            itemToSuspend,
            itemToChange,
            filters: {
                status: statusFilter,
                type: typeFilter,
            },
        },
        derived: {
            filteredCandidates,
        },
        handlers: {
            // UI Handlers
            setEditingRowId,
            setStatusFilter,
            setTypeFilter,
            handleEditRow,
            handleCancelRowEdit,
            requestSuspendRow,
            handleCellChange,
            closeFlashModal,
            setItemToSuspend,
            setItemToChange,
            // API Handlers
            handleConfirmChange,
            handleConfirmSuspend,
        },
        flashModal,
    };
}
