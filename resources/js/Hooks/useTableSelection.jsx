import { useState, useCallback } from "react";

/**
 * useTableSelection - Hook especializado en la gestión de selección de elementos (checkboxes).
 * 
 * @returns {Object}
 */
export const useTableSelection = () => {
    const [seleccionados, setSeleccionados] = useState([]);

    /**
     * Alterna la selección de un elemento por su ID.
     */
    const handleToggleSelect = useCallback((id) => {
        setSeleccionados((prev) =>
            prev.includes(id)
                ? prev.filter((selectedId) => selectedId !== id)
                : [...prev, id]
        );
    }, []);

    /**
     * Limpia toda la selección actual.
     */
    const handleClearSelection = useCallback(() => {
        setSeleccionados([]);
    }, []);

    return {
        seleccionados,
        setSeleccionados,
        handleToggleSelect,
        handleClearSelection,
    };
};
