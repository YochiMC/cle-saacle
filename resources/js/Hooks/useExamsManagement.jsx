import { useState, useCallback } from "react";
import { router, useForm } from "@inertiajs/react";
import { useCatalogData } from "./useCatalogData";
import { filterExams } from "@/Pages/Test_Vik/examFilters";

/**
 * Hook Empresarial para la Gestión de Exámenes (Hook Composition).
 * Orquesta `useCatalogData` y le añade la lógica
 * específica de negocio de Modal, Peticiones y Manejo de Formulario.
 */
export const useExamsManagement = (examenes = []) => {
    // 1. Estado Base
    const catalog = useCatalogData({
        initialData: examenes,
        filterFunction: filterExams,
        initialFilters: {
            estado: "",
            period: "",
            mode: "",
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
                    setFormData({
                        exam_type: payload.exam_type || "",
                        status: payload.status || "enrolling",
                        start_date: payload.start_date || "",
                        end_date: payload.end_date || "",
                        application_time: payload.application_time || "",
                        mode: payload.mode || "",
                        period_id: payload.period_id?.toString() || "",
                        capacity: payload.capacity?.toString() || "",
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
            e.preventDefault();

            transform((data) => ({
                ...data,
                capacity: parseInt(data.capacity) || 0,
                teacher_id: data.teacher_id === "none" ? null : data.teacher_id,
            }));

            const onSuccess = () => handleCloseModal("formulario");

            if (itemEditando) {
                put(route("exams.update", itemEditando.id), { onSuccess });
            } else {
                post(route("exams.store"), { onSuccess });
            }
        },
        [post, put, transform, handleCloseModal, itemEditando],
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
        itemEditando,
        itemViendo,
        handleOpenModal,
        handleCloseModal,

        // Formulario
        formData,
        setFormData,
        submitForm,
        processing,
        errors,

        // Bulk / Acciones
        handleBulkStatus,
        handleBulkDelete,
        handleEnroll,
    };
};
