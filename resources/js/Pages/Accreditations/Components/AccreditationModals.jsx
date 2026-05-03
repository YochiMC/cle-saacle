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
    handleConfirmChange 
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

            {/* Modal para Confirmar Suspensión Individual */}
            <ConfirmModal
                isOpen={itemToSuspend != null}
                onClose={() => setItemToSuspend(null)}
                onConfirm={handleConfirmSuspend}
                title="Suspender candidato"
                message={`Al confirmar, ${itemToSuspend?.full_name || "el alumno"} será extraído del flujo de acreditaciones y su estatus pasará a "Suspendido". ¿Deseas proceder?`}
                confirmText="Sí, suspender alumno"
                variant="warning"
            />

            {/* Modal para Confirmar Cambio de Estatus Manual */}
            <ConfirmModal
                isOpen={itemToChange != null}
                onClose={() => setItemToChange(null)}
                onConfirm={handleConfirmChange}
                title="Confirmar actualización"
                message={`¿Estás seguro de que deseas cambiar el estatus de ${itemToChange?.targetName} a "${itemToChange?.newLabel}"? Esto alterará su historial académico.`}
                confirmText="Sí, actualizar estatus"
                variant="warning"
            />
        </>
    );
};

export default React.memo(AccreditationModals);
