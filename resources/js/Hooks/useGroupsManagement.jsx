import { useState, useCallback } from "react";
import { router, useForm } from "@inertiajs/react";
import { useCatalogData } from "./useCatalogData";
import { filterGroups } from "@/Pages/Groups/Filters";

/**
 * Hook Empresarial para la Gestión de Grupos (Patrón Custom Hook - SRP).
 * Actúa como orquestador de lógica de negocio para el módulo de grupos:
 * 1. Gestiona el Estado del catálogo (listado, filtros, selección).
 * 2. Controla la visibilidad y datos de los Modales.
 * 3. Maneja el estado y validaciones del Formulario de grupos (useForm).
 * 4. Ejecuta las Peticiones de red (CRUD, Bulk actions, inscripción).
 *
 * Patrón homologado con `useExamsManagement` para consistencia total
 * entre módulos (Dumb Components + Smart Hooks).
 *
 * @param {Array} grupos - Colección inicial de grupos desde el servidor (Inertia props).
 * @returns {Object} API del hook para ser consumida por los componentes de UI.
 */
export const useGroupsManagement = (grupos = []) => {
    // ── 1. Estado base del catálogo ────────────────────────────────────────────
    const catalog = useCatalogData({
        initialData: grupos,
        filterFunction: filterGroups,
        initialFilters: {
            estado: "",
            nivel: "",
            ordenCupo: null,
        },
    });

    // ── 2. Modales ─────────────────────────────────────────────────────────────
    const [modales, setModales] = useState({
        formulario: false,
        detalles: false,
    });
    const [itemEditando, setItemEditando] = useState(null);
    const [itemViendo, setItemViendo] = useState(null);

    // ── 3. Formulario (Inertia useForm) ───────────────────────────────────────
    const {
        data: formData,
        setData: setFormData,
        post,
        put,
        transform,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: "",
        mode: "",
        type: "",
        capacity: "",
        schedule: "",
        classroom: "",
        meeting_link: "",
        status: "Activo",
        period_id: "",
        teacher_id: "none",
        level_id: "",
    });

    /**
     * Abre un modal por nombre y, si es el formulario de edición,
     * inicializa el formData con los datos del item a editar.
     * Extrae de forma segura valores de objetos Enum que llegan del backend.
     */
    const handleOpenModal = useCallback(
        (type, payload = null) => {
            setModales((prev) => ({ ...prev, [type]: true }));
            clearErrors();

            if (type === "formulario") {
                setItemEditando(payload);
                if (payload) {
                    // Extracción segura (coalescencia nula + encadenamiento opcional)
                    // Previene campos vacíos cuando el backend devuelve Enums/Objetos
                    setFormData({
                        name: payload.name ?? "",
                        mode: payload.mode ?? "",
                        type: payload.type ?? "",
                        capacity: payload.capacity?.toString() ?? "",
                        schedule: payload.schedule ?? "",
                        classroom: payload.classroom ?? "",
                        meeting_link: payload.meeting_link ?? "",
                        status: payload.status ?? "Activo",
                        period_id: payload.period_id?.toString() ?? "",
                        teacher_id: payload.teacher_id
                            ? payload.teacher_id.toString()
                            : "none",
                        level_id:
                            (payload.level_id || payload.level?.id)?.toString() ?? "",
                    });
                } else {
                    reset();
                }
            }

            if (type === "detalles") setItemViendo(payload);
        },
        [setFormData, reset, clearErrors],
    );

    /** Cierra un modal por nombre y limpia su estado asociado. */
    const handleCloseModal = useCallback(
        (type) => {
            setModales((prev) => ({ ...prev, [type]: false }));
            if (type === "formulario") {
                setItemEditando(null);
                reset();
                clearErrors();
            }
            if (type === "detalles") setItemViendo(null);
        },
        [reset, clearErrors],
    );

    // ── 4. Envío del formulario ────────────────────────────────────────────────
    /**
     * Maneja el envío del formulario: transforma los datos y
     * elige entre POST (crear) o PUT (editar) según `itemEditando`.
     */
    const submitForm = useCallback(
        (e) => {
            if (e) e.preventDefault();

            const isTypeChanged = itemEditando && 
                formData.type !== (itemEditando.type?.value ?? itemEditando.type);

            if (isTypeChanged) {
                setModales((prev) => ({ ...prev, confirmTypeChange: true }));
                return;
            }

            confirmSubmit();
        },
        [itemEditando, formData.type]
    );

    const confirmSubmit = useCallback(
        () => {
            transform((data) => ({
                ...data,
                capacity: parseInt(data.capacity) || 0,
                teacher_id:
                    data.teacher_id === "none" ? null : data.teacher_id,
            }));

            const onSuccess = () => {
                handleCloseModal("formulario");
                setModales((prev) => ({ ...prev, confirmTypeChange: false }));
            };

            if (itemEditando) {
                put(route("groups.update", itemEditando.id), { onSuccess });
            } else {
                post(route("groups.store"), { onSuccess });
            }
        },
        [post, put, transform, handleCloseModal, itemEditando]
    );

    // ── 5. Peticiones Bulk / Acciones ─────────────────────────────────────────
    const handleBulkStatus = useCallback(
        (nuevoEstado) => {
            if (!nuevoEstado || catalog.seleccionados.length === 0) return;
            router.put(
                route("groups.bulk-status"),
                { ids: catalog.seleccionados, new_status: nuevoEstado },
                { onSuccess: () => catalog.clearSelection() },
            );
        },
        [catalog],
    );

    const handleBulkDelete = useCallback(() => {
        if (catalog.seleccionados.length === 0) return;
        router.delete(route("groups.bulk-delete"), {
            data: { ids: catalog.seleccionados },
            onSuccess: () => catalog.clearSelection(),
        });
    }, [catalog]);

    const handleEnroll = useCallback((id) => {
        router.post(route("groups.enroll", id), {}, { preserveScroll: true });
    }, []);

    return {
        ...catalog,

        // Modales
        modales,
        setModales,
        itemEditando,
        itemViendo,
        handleOpenModal,
        handleCloseModal,

        // Formulario
        formData,
        setFormData,
        submitForm,
        confirmSubmit,
        processing,
        errors,

        // Bulk / Acciones
        handleBulkStatus,
        handleBulkDelete,
        handleEnroll,
    };
};
