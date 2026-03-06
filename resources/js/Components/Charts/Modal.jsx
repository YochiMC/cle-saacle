import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
    // Si isOpen es falso, no renderizamos nada (la ventana está oculta)
    if (!isOpen) return null;

    return (
        // Fondo oscuro semi-transparente
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500 bg-opacity-50 backdrop-blur-sm p-4">
            {/* Contenedor de la ventana blanca */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative animate-fade-in-up">
                {/* Encabezado del Modal */}
                <div className="flex justify-between items-center p-5 border-b border-white-100">
                    <h3 className="text-xl font-bold text-[#1B396A]">
                        {title}
                    </h3>

                    {/* Botón de cerrar (X) */}
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition-colors text-2xl leading-none"
                        aria-label="Cerrar ventana"
                    >
                        &times;
                    </button>
                </div>

                {/* Cuerpo del Modal (Aquí entra la magia de 'children') */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
