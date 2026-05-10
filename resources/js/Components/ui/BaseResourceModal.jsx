import React from "react";
import DataFormModal from "@/Components/DataTable/DataFormModal";
import FormErrors from "@/Components/ui/FormErrors";
import ConfirmModal from "@/Components/ui/ConfirmModal";
import { FieldGroup } from "@/Components/ui/field";

/**
 * BaseResourceModal — Orquestador de formularios para recursos del sistema.
 * 
 * Implementa el Principio de Abierto/Cerrado (OCP): 
 * Absorbe la estructura repetitiva (errores, botones, diálogos de confirmación)
 * y permite inyectar cualquier contenido de negocio vía `children`.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen        - Controla la visibilidad del modal principal.
 * @param {Function} props.onClose      - Callback al cerrar el modal.
 * @param {string} props.title          - Título del modal.
 * @param {Function} props.onSubmit     - Función de envío del formulario.
 * @param {boolean} props.processing    - Estado de carga (Inertia).
 * @param {Object} props.errors         - Errores de validación de Inertia.
 * @param {string} [props.maxWidth="2xl"] - Ancho máximo del modal.
 * @param {Object} [props.confirmConfig] - Configuración opcional para un diálogo de advertencia previo al envío.
 * @param {React.ReactNode} props.children - Campos específicos del formulario.
 */
export default function BaseResourceModal({
    isOpen,
    onClose,
    title,
    onSubmit,
    processing,
    errors,
    maxWidth = "2xl",
    confirmConfig = null,
    children,
}) {
    return (
        <>
            <DataFormModal
                isOpen={isOpen}
                onClose={onClose}
                title={title}
                onSubmit={onSubmit}
                processing={processing}
                maxWidth={maxWidth}
            >
                {/* Visualización unificada de errores de servidor */}
                <FormErrors errors={errors} />

                <FieldGroup>
                    {children}
                </FieldGroup>
            </DataFormModal>

            {/* Diálogo de confirmación inyectable (ej. avisos de reinicio de datos) */}
            {confirmConfig && (
                <ConfirmModal
                    isOpen={confirmConfig.isOpen}
                    onClose={confirmConfig.onClose}
                    onConfirm={confirmConfig.onConfirm}
                    title={confirmConfig.title}
                    message={confirmConfig.message}
                    confirmText={confirmConfig.confirmText}
                    variant={confirmConfig.variant || "warning"}
                />
            )}
        </>
    );
}
