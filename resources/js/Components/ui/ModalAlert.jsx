import React from "react";
import Modal from "@/Components/Charts/Modal";

const ModalAlert = ({ isOpen, onClose, type = "info", title, message }) => {
    const styles = {
        success: {
            iconColor: "text-blue-600",
            borderColor: "border-blue-600",
            button: "bg-blue-600 hover:bg-blue-700",
            icon: "✓",
        },
        error: {
            iconColor: "text-red-600",
            borderColor: "border-red-600",
            button: "bg-red-600 hover:bg-red-700",
            icon: "✕",
        },
        warning: {
            iconColor: "text-yellow-500",
            borderColor: "border-yellow-500",
            button: "bg-yellow-500 hover:bg-yellow-600",
            icon: "!",
        },
        info: {
            iconColor: "text-[#1B396A]",
            borderColor: "border-[#1B396A]",
            button: "bg-[#1B396A] hover:bg-[#142952]",
            icon: "i",
        },
    };

    const current = styles[type] || styles.info;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="text-center">
                {/* Icono circular */}
                <div
                    className={`mx-auto flex items-center justify-center w-20 h-20 rounded-full border-4 ${current.borderColor} ${current.iconColor} text-4xl font-bold mb-6`}
                >
                    {current.icon}
                </div>

                {/* Mensaje */}
                <p className="text-gray-500 text-sm mb-6">{message}</p>

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
