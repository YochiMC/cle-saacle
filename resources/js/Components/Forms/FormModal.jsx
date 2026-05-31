/**
 * FormModal
 *
 * Contenedor modal reutilizable para formularios. Renderiza un overlay con
 * backdrop, un header con título y botón de cierre, y un body que proyecta
 * el contenido hijo. Se cierra al presionar la tecla Escape.
 *
 * @component
 *
 * @param {boolean}   [show=false]  - Controla la visibilidad del modal.
 * @param {Function}  onClose       - Callback invocado al cerrar el modal.
 * @param {string}    [title]       - Texto del encabezado del modal.
 * @param {ReactNode} children      - Contenido interno (formulario, etc.).
 * @param {string}    [panelClassName] - Clases adicionales para el contenedor principal.
 *
 * @example
 * <FormModal
 *   title="Nuevo alumno"
 *   show={isOpen}
 *   onClose={() => setIsOpen(false)}
 * >
 *   <form>...</form>
 * </FormModal>
 */

import { useEffect } from 'react';

export default function FormModal({ show = false, onClose, title, children, panelClassName = '' }) {

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-4">

            {/* Contenedor del Modal modificado */}
            <div className={`max-h-[90vh] w-full max-w-[calc(100vw-1.5rem)] overflow-y-auto transition-all transform bg-white rounded-lg shadow-xl flex flex-col sm:w-fit sm:min-w-[300px] sm:max-w-[90vw] ${panelClassName}`}>

                {/* Header estático en la parte superior */}
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
                    {title && (
                        <h2 className="text-base font-semibold text-gray-800 sm:text-lg">{title}</h2>
                    )}
                    <button
                        onClick={onClose}
                        className="text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
                        aria-label="Cerrar modal"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                {/* Body (Aquí va tu formulario) */}
                <div className="p-4 sm:p-6">
                    {children}
                </div>

            </div>
        </div>
    );
}
