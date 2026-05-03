import React from "react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

/**
 * Cascarón Genérico para Formularios.
 * Estandariza la estructura del Modal base agregando soporte automático al ciclo
 * del <form> y estandarización del panel de botones alineados inferior.
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string|React.ReactNode} title - Título que encabeza el modal.
 * @param {function} onSubmit - Referencia a la función post/put (e.preventDefault internalmente asegurado en padre o pasarlo al evento onsubmit normal)
 * @param {boolean} processing - Estado del form enviado que deshabilita validación múltiple.
 * @param {string} [submitText] - Texto a mostrar por defecto, p. ej. "Guardar".
 * @param {string} [maxWidth] - Ancho del modal, por defecto "md" para Inertia Base Modal.
 * @param {React.ReactNode} children - Los InputLabels y componentes de datos (FieldGroups/FieldSet).
 */
export default function DataFormModal({
    isOpen,
    onClose,
    title,
    onSubmit,
    processing = false,
    submitText = "Guardar",
    maxWidth = "2xl", // Ajuste para dar soporte al GroupModal que usa grillas complejas.
    children,
}) {
    return (
        <Modal show={isOpen} onClose={onClose} maxWidth={maxWidth}>
            <form onSubmit={onSubmit} className="flex flex-col max-h-[90vh]">
                {/* 1. Cabecera */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                        {title}
                    </h2>
                </div>

                {/* 2. Cuerpo de Formulario */}
                <div className="px-6 py-6 overflow-y-auto flex-grow space-y-4">
                    {children}
                </div>

                {/* 3. Footer Estándar Formulario */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4 shrink-0 rounded-b-lg">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing} className={processing ? "opacity-75" : ""}>
                        {processing ? "Guardando..." : submitText}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
