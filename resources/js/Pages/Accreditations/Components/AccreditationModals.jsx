import React from "react";
import ModalAlert from "@/Components/ui/ModalAlert";
import ConfirmModal from "@/Components/ui/ConfirmModal";

/**
 * Componente: AccreditationModals
 *
 * Agrupa todos los modales vinculados al flujo de acreditación.
 */
const AccreditationModals = ({
    flashModal,
    closeFlashModal,
    itemToSuspend,
    setItemToSuspend,
    handleConfirmSuspend,
    itemToChange,
    setItemToChange,
    handleConfirmChange,
}) => {
    return (
        <>
            {/* Modal de Alerta / Feedback de Operación */}
            <ModalAlert
                isOpen={flashModal.isOpen}
                onClose={closeFlashModal}
                type={flashModal.type}
                title={flashModal.title}
                message={flashModal.message}
            />

            {/* Modal to confirm disabling an individual candidate */}
            <ConfirmModal
                isOpen={itemToSuspend != null}
                onClose={() => setItemToSuspend(null)}
                onConfirm={handleConfirmSuspend}
                title="Inhabilitar candidato"
                message={`Al confirmar, ${itemToSuspend?.full_name || "el alumno"} será extraído del flujo de acreditaciones y su estatus pasará a "Inhabilitado". ¿Deseas proceder?`}
                confirmText="Sí, inhabilitar alumno"
                variant="warning"
            />

            {/* Modal para Confirmar Cambio de Estatus Manual */}
            <ConfirmModal
                isOpen={itemToChange != null}
                onClose={() => setItemToChange(null)}
                onConfirm={handleConfirmChange}
                title="Confirmar actualización"
                message={`¿Estás seguro de que deseas cambiar el estatus de ${itemToChange?.targetName} a "${itemToChange?.newLabel}"? Esto alterará su registro académico.`}
                confirmText="Sí, actualizar estatus"
                variant="warning"
            />
        </>
    );
};

export default React.memo(AccreditationModals);
