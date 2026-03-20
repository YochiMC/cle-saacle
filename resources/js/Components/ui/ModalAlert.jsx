import React from "react";
import Modal from "@/Components/Charts/Modal";

const ModalAlert = ({ isOpen, onClose, type = "info", title, message }) => {
    const fallbackTitles = {
        success: "¡Operación exitosa!",
        error: "¡Ups! Algo salió mal",
        warning: "Atención",
        info: "Información",
    };

    const styles = {
        success: {
            iconColor: "text-blueTec",
            borderColor: "border-blueTec",
            button: "bg-blueTec hover:bg-blueTec/90",
            icon: "✓",
        },
        error: {
            iconColor: "text-red-600",
            borderColor: "border-red-600",
            button: "bg-red-600 hover:bg-red-700",
            icon: "✕",
        },
        warning: {
            iconColor: "text-orangeTec",
            borderColor: "border-orangeTec",
            button: "bg-orangeTec hover:bg-orangeTec/90",
            icon: "!",
        },
        info: {
            iconColor: "text-blueTec",
            borderColor: "border-blueTec",
            button: "bg-blueTec hover:bg-blueTec/90",
            icon: "i",
        },
    };

    const current = styles[type] || styles.info;
    const resolvedTitle = title || fallbackTitles[type] || fallbackTitles.info;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={resolvedTitle}>
            <div className="text-center">
                {/* Icono circular */}
                <div
                    className={`mx-auto flex items-center justify-center w-20 h-20 rounded-full border-4 ${current.borderColor} ${current.iconColor} text-4xl font-bold mb-6`}
                >
                    {current.icon}
                </div>

                {/* Mensaje */}
                <p className="mb-6 text-sm text-gray-600">{message}</p>

                {/* Botón */}
                <button
                    onClick={onClose}
                    className={`px-6 py-2 text-white rounded-lg transition-all duration-200 ${current.button}`}
                >
                    OK
                </button>
            </div>
        </Modal>
    );
};

export default ModalAlert;
