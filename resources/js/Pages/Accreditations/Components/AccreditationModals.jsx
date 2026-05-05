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
                title="Disable candidate"
                message={`On confirm, ${itemToSuspend?.full_name || "the student"} will be removed from the accreditation flow and their status will change to "Disabled". Proceed?`}
                confirmText="Yes, disable student"
                variant="warning"
            />

            {/* Modal para Confirmar Cambio de Estatus Manual */}
            <ConfirmModal
                isOpen={itemToChange != null}
                onClose={() => setItemToChange(null)}
                onConfirm={handleConfirmChange}
                title="Confirm update"
                message={`Are you sure you want to change the status of ${itemToChange?.targetName} to "${itemToChange?.newLabel}"? This will alter their academic record.`}
                confirmText="Yes, update status"
                variant="warning"
            />
        </>
    );
};

export default React.memo(AccreditationModals);
