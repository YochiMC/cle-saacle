import { useEffect } from 'react';

export default function FormModal({ show = false, onClose, children }) {

    // Cerrar con la tecla Escape
    useEffect(() => {
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">

            {/* Contenedor del Modal modificado */}
            <div className="w-fit min-w-[300px] max-w-[90vw] max-h-[90vh] overflow-y-auto transition-all transform bg-white rounded-lg shadow-xl flex flex-col">

                {/* Header estático en la parte superior */}
                <div className="sticky top-0 z-10 flex items-center justify-end px-6 py-4 bg-white border-b border-gray-100">
                    <button
                        onClick={onClose}
                        className="text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
                        aria-label="Cerrar modal"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                {/* Body (Aquí va tu formulario) */}
                <div className="p-6">
                    {children}
                </div>

            </div>
        </div>
    );
}
