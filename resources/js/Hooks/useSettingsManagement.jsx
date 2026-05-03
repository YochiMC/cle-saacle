import { useCallback } from "react";
import { useForm } from "@inertiajs/react";

/**
 * Hook de Gestión de Configuraciones del Sistema (Patrón Custom Hook - SRP).
 *
 * Encapsula toda la lógica del formulario de configuraciones administrativas:
 * - Inicializa el estado del formulario a partir de los datos del servidor.
 * - Expone la función `submitSettings` para enviar los cambios vía PUT.
 *
 * @param {Object} configuraciones - Objeto clave-valor con los settings actuales del servidor.
 *                                   Ejemplo: { courses_enrollment_start: '2026-08-01', ... }
 *
 * @returns {Object} API del hook para ser consumida por los componentes de UI:
 *  - formData         {Object}   Estado actual del formulario (clave → valor).
 *  - setFormData      {Function} Setter de Inertia para un campo específico.
 *  - processing       {boolean}  true mientras se procesa la petición HTTP.
 *  - errors           {Object}   Errores de validación por campo (siempre objeto, nunca undefined).
 *  - submitSettings   {Function} Handler de envío del formulario (e) => void.
 */
export const useSettingsManagement = (configuraciones = {}) => {
    // ──────────────────────────────────────────────────────────────────────────
    // Estado del formulario (Inertia useForm)
    // Los valores se leen del objeto recibido del servidor; si no existe la clave,
    // se inicializa como cadena vacía para que los inputs controlados no sean undefined.
    // ──────────────────────────────────────────────────────────────────────────
    const {
        data: formData,
        setData: setFormData,
        put,
        processing,
        errors,
    } = useForm({
        // ── Calendario de Cursos Regulares ────────────────────────────────
        courses_enrollment_start:
            configuraciones.courses_enrollment_start ?? "",
        courses_enrollment_end: configuraciones.courses_enrollment_end ?? "",
        courses_active_start: configuraciones.courses_active_start ?? "",
        courses_active_end: configuraciones.courses_active_end ?? "",
        courses_evaluation_start:
            configuraciones.courses_evaluation_start ?? "",
        courses_evaluation_end: configuraciones.courses_evaluation_end ?? "",

        // ── Calendario de Exámenes ────────────────────────────────────────
        exams_enrollment_start: configuraciones.exams_enrollment_start ?? "",
        exams_enrollment_end: configuraciones.exams_enrollment_end ?? "",
        exams_evaluation_start: configuraciones.exams_evaluation_start ?? "",
        exams_evaluation_end: configuraciones.exams_evaluation_end ?? "",

        // ── Calendario Programa Egresados (PE) ────────────────────────────
        pe_enrollment_start: configuraciones.pe_enrollment_start ?? "",
        pe_enrollment_end: configuraciones.pe_enrollment_end ?? "",
        pe_active_start: configuraciones.pe_active_start ?? "",
        pe_active_end: configuraciones.pe_active_end ?? "",
        pe_evaluation_start: configuraciones.pe_evaluation_start ?? "",
        pe_evaluation_end: configuraciones.pe_evaluation_end ?? "",

        // ── Configuración Visual ──────────────────────────────────────────
        teacher_reveal_date: configuraciones.teacher_reveal_date ?? "",
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Envío del formulario
    //
    // El controlador `updateBulk` acepta directamente el objeto plano { campo: valor }
    // que `useForm` de Inertia serializa de forma automática. No se requiere ninguna
    // transformación en el frontend.
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Maneja el submit del formulario de configuraciones.
     * Previene el comportamiento por defecto y envía los datos a `settings.update-bulk` via PUT.
     *
     * @param {React.FormEvent} e - Evento de submit del formulario.
     */
    const submitSettings = useCallback(
        (e) => {
            if (e?.preventDefault) {
                e.preventDefault();
            }

            put(route("settings.update-bulk"), {
                preserveScroll: true,
            });
        },
        [put],
    );

    // ──────────────────────────────────────────────────────────────────────────
    // CRÍTICO (Bug Fix): `errors` puede llegar como `undefined` en el primer
    // render antes de que Inertia establezca el estado. El fallback `errors || {}`
    // previene el `TypeError: Cannot read properties of undefined (reading 'length')`
    // que ocurre en `FormErrors` al ejecutar `Object.values(errors)`.
    // ──────────────────────────────────────────────────────────────────────────
    return {
        formData,
        setFormData,
        processing,
        errors: errors || {},
        submitSettings,
    };
};
