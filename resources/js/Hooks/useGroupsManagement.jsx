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
        setError,
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
                            (
                                payload.level_id || payload.level?.id
                            )?.toString() ?? "",
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

            if (itemEditando) {
                const normalize = (value) => {
                    if (value === null || value === undefined || value === "")
                        return "";
                    return String(value).trim();
                };

                const current = {
                    mode: normalize(formData.mode),
                    type: normalize(formData.type),
                    capacity: normalize(formData.capacity),
                    schedule: normalize(formData.schedule),
                    classroom: normalize(formData.classroom),
                    meeting_link: normalize(formData.meeting_link),
                    status: normalize(formData.status),
                    period_id: normalize(formData.period_id),
                    teacher_id: normalize(
                        formData.teacher_id === "none"
                            ? ""
                            : formData.teacher_id,
                    ),
                    level_id: normalize(formData.level_id),
                };

                const original = {
                    mode: normalize(itemEditando.mode),
                    type: normalize(itemEditando.type),
                    capacity: normalize(itemEditando.capacity),
                    schedule: normalize(itemEditando.schedule),
                    classroom: normalize(itemEditando.classroom),
                    meeting_link: normalize(itemEditando.meeting_link),
                    status: normalize(
                        itemEditando.status?.value ?? itemEditando.status,
                    ),
                    period_id: normalize(itemEditando.period_id),
                    teacher_id: normalize(itemEditando.teacher_id),
                    level_id: normalize(
                        itemEditando.level_id || itemEditando.level?.id,
                    ),
                };

                const changed = Object.keys(current).filter(
                    (key) => current[key] !== original[key],
                );

                if (changed.length === 0) {
                    setError(
                        "_form",
                        "No detectamos cambios en el formulario. Modifica al menos un campo antes de guardar.",
                    );
                    return;
                }
            }

            const originalType = itemEditando?.type?.value ?? itemEditando?.type;
            const currentType = formData.type;

            const isTypeChanged = itemEditando && currentType !== originalType;
            const involvesEgresados = 
                (originalType === "Programa Egresados" && currentType !== "Programa Egresados") ||
                (originalType !== "Programa Egresados" && currentType === "Programa Egresados");

            if (isTypeChanged && involvesEgresados) {
                setModales((prev) => ({ ...prev, confirmTypeChange: true }));
                return;
            }

            confirmSubmit();
        },
        [itemEditando, formData, setError],
    );

    const confirmSubmit = useCallback(() => {
        transform((data) => ({
            ...data,
            capacity: parseInt(data.capacity) || 0,
            teacher_id: data.teacher_id === "none" ? null : data.teacher_id,
        }));

        const onSuccess = () => {
            handleCloseModal("formulario");
            setModales((prev) => ({ ...prev, confirmTypeChange: false }));
            router.reload({ preserveState: false, preserveScroll: true });
        };

        const onError = () => {
            setModales((prev) => ({ ...prev, confirmTypeChange: false }));
        };

        if (itemEditando) {
            put(route("groups.update", itemEditando.id), {
                onSuccess,
                onError,
                preserveState: false,
                preserveScroll: true,
            });
        } else {
            post(route("groups.store"), {
                onSuccess,
                onError,
                preserveState: false,
                preserveScroll: true,
            });
        }
    }, [post, put, transform, handleCloseModal, itemEditando]);

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
