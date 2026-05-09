import { useState, useMemo, useCallback } from "react";
import { router } from "@inertiajs/react";
import useFlashAlert from "@/Hooks/useFlashAlert";
import { STATUS_SELECT_OPTIONS } from "../Constants/accreditationConstants";

/**
 * Custom Hook: Headless Controller para la gestión de Acreditaciones.
 *
 * Centraliza la lógica de filtrado, estados de UI y mutaciones vía Inertia.
 */
export default function useAccreditationManager(candidates, initialFilters = {}) {
    // 1. Estados de Interfaz
    const { flashModal, closeFlashModal, showFlash } = useFlashAlert();
    const [itemToSuspend, setItemToSuspend] = useState(null);
    const [itemToChange, setItemToChange] = useState(null);
    const [editingRowId, setEditingRowId] = useState(null);

    // 2. Estados de Filtrado (Sincronizados con URL)
    const [statusFilter, setStatusFilterState] = useState(initialFilters.status || "");
    const [periodFilter, setPeriodFilterState] = useState(initialFilters.period_id || "");
    const [typeFilter, setTypeFilter] = useState("");

    // Sincronización con Backend vía Inertia
    const updateFilters = useCallback((newFilters) => {
        // Combinamos el estado actual con el nuevo cambio para la petición
        const status = newFilters.hasOwnProperty('status') ? newFilters.status : statusFilter;
        const periodId = newFilters.hasOwnProperty('period_id') ? newFilters.period_id : periodFilter;

        const params = {};
        if (status && status !== 'all') params.status = status;
        if (periodId && periodId !== 'all') params.period_id = periodId;

        router.get('/acreditaciones', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    }, [statusFilter, periodFilter]);

    const setStatusFilter = (val) => {
        setStatusFilterState(val);
        updateFilters({ status: val });
    };

    const setPeriodFilter = (val) => {
        setPeriodFilterState(val);
        updateFilters({ period_id: val });
    };

    // 3. Lógica de Filtrado Derivada (Tipo se mantiene local por ahora)
    const filteredCandidates = useMemo(() => {
        return candidates.filter((item) => {
            const matchesType = typeFilter === "" ||
                (item?.achieved_by && item.achieved_by.toLowerCase() === typeFilter.toLowerCase());
            return matchesType;
        });
    }, [candidates, typeFilter]);

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
                    showFlash("success", "El estatus de acreditación ha sido actualizado.");
                    setEditingRowId(null);
                },
                onError: () => {
                    showFlash("error", "Ocurrió un error al intentar actualizar el estatus.");
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
            { status: "disabled" },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    showFlash("success", "El alumno ha sido inhabilitado correctamente.");
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
                period_id: periodFilter,
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
            setPeriodFilter,
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
