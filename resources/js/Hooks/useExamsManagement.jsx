import { useState, useCallback } from "react";
import { router, useForm } from "@inertiajs/react";
import { useCatalogData } from "./useCatalogData";
import { filterExams } from "@/Pages/Exams/Filters";

/**
 * Hook Empresarial para la Gestión de Exámenes (Patrón Custom Hook - SRP).
 * Actúa como orquestador de lógica de negocio para el módulo de exámenes:
 * 1. Gestiona el Estado del catálogo (listado, filtros, selección).
 * 2. Controla la visibilidad y datos de los Modales.
 * 3. Maneja el estado local y validaciones del Formulario de exámenes.
 * 4. Ejecuta las Peticiones de red (Bulk actions, inscripción).
 *
 * @param {Array} examenes - Colección inicial de exámenes desde el servidor.
 * @returns {Object} API del hook para ser consumida por los componentes de UI.
 */
export const useExamsManagement = (examenes = []) => {
    // 1. Estado Base
    const catalog = useCatalogData({
        initialData: examenes,
        filterFunction: filterExams,
        initialFilters: {
            estado: "",
            exam_type: "",
            ordenCupo: null,
        },
    });

    // 2. Modales
    const [modales, setModales] = useState({
        formulario: false,
        detalles: false,
    });
    const [itemEditando, setItemEditando] = useState(null);
    const [itemViendo, setItemViendo] = useState(null);

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
        exam_type: "",
        status: "enrolling",
        capacity: "",
        start_date: "",
        end_date: "",
        mode: "",
        application_time: "",
        classroom: "",
        period_id: "",
        teacher_id: "none",
    });

    const handleOpenModal = useCallback(
        (type, payload = null) => {
            setModales((prev) => ({ ...prev, [type]: true }));
            clearErrors();
            if (type === "formulario") {
                setItemEditando(payload);
                if (payload) {
                    // Extracción segura (Operador coalescencia nula / encadenamiento opcional)
                    // Previene el bug de campos vacíos cuando el backend devuelve Enums/Objetos
                    setFormData({
                        exam_type: payload.exam_type?.value ?? payload.exam_type ?? "",
                        status: payload.status?.value ?? payload.status ?? "enrolling",
                        start_date: payload.start_date || "",
                        end_date: payload.end_date || "",
                        application_time: payload.application_time || "",
                        mode: payload.mode?.value ?? payload.mode ?? "",
                        period_id: payload.period_id?.toString() ?? "",
                        capacity: payload.capacity?.toString() ?? "",
                        classroom: payload.classroom || "",
                        teacher_id: payload.teacher_id
                            ? payload.teacher_id.toString()
                            : "none",
                    });
                } else {
                    reset();
                }
            }
            if (type === "detalles") setItemViendo(payload);
        },
        [setFormData, reset, clearErrors],
    );

    const handleCloseModal = useCallback(
        (type) => {
            setModales((prev) => ({ ...prev, [type]: false }));
            if (type === "formulario") {
                setItemEditando(null);
                reset();
                clearErrors();
            }
            if (type === "detalles") {
                setItemViendo(null);
            }
        },
        [reset, clearErrors],
    );

    // Lógica de Envío de Formulario
    const submitForm = useCallback(
        (e) => {
            if (e) e.preventDefault();

            const isTypeChanged = itemEditando && 
                formData.exam_type !== (itemEditando.exam_type?.value ?? itemEditando.exam_type);

            if (isTypeChanged) {
                setModales((prev) => ({ ...prev, confirmTypeChange: true }));
                return;
            }

            confirmSubmit();
        },
        [itemEditando, formData.exam_type]
    );

    const confirmSubmit = useCallback(
        () => {
            transform((data) => ({
                ...data,
                capacity: parseInt(data.capacity) || 0,
                teacher_id: data.teacher_id === "none" ? null : data.teacher_id,
            }));

            const onSuccess = () => {
                handleCloseModal("formulario");
                setModales((prev) => ({ ...prev, confirmTypeChange: false }));
            };

            if (itemEditando) {
                put(route("exams.update", itemEditando.id), { onSuccess });
            } else {
                post(route("exams.store"), { onSuccess });
            }
        },
        [post, put, transform, handleCloseModal, itemEditando]
    );

    // 4. Peticiones Bulk / Acciones
    const handleBulkStatus = useCallback(
        (nuevoEstado) => {
            if (!nuevoEstado || catalog.seleccionados.length === 0) return;
            router.post(
                route("exams.bulk-status"),
                { ids: catalog.seleccionados, status: nuevoEstado },
                {
                    onSuccess: () => catalog.clearSelection(),
                },
            );
        },
        [catalog],
    );

    const handleBulkDelete = useCallback(() => {
        if (catalog.seleccionados.length === 0) return;
        router.delete(route("exams.bulk-delete"), {
            data: { ids: catalog.seleccionados },
            onSuccess: () => catalog.clearSelection(),
        });
    }, [catalog]);

    const handleEnroll = useCallback((id) => {
        router.post(route("exams.enroll", id), {}, { preserveScroll: true });
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
