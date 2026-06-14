import React, { useState, useEffect } from "react";
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
    const [password, setPassword] = useState("");

    // Limpiar contraseña al cerrar o cambiar el modal
    useEffect(() => {
        if (!itemToChange) {
            setPassword("");
        }
    }, [itemToChange]);

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
                onConfirm={() => handleConfirmChange(password)}
                title="Confirmar actualización"
                message={`¿Estás seguro de que deseas cambiar el estatus de ${itemToChange?.targetName} a "${itemToChange?.newLabel}"? Esto alterará su registro académico.`}
                confirmText="Sí, actualizar estatus"
                variant="warning"
            >
                {itemToChange?.newValue === "accredited" && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña de Administrador requerida
                        </label>
                        <input
                            type="password"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Ingresa tu contraseña para autorizar"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                )}
            </ConfirmModal>
        </>
    );
};

export default React.memo(AccreditationModals);
