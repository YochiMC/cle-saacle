import { useState, useCallback } from "react";

/**
 * useTableModals - Hook especializado en la gestión de estados de modales y elementos activos.
 * 
 * @param {Object} initialModals - Estado inicial de visibilidad de los modales.
 * @returns {Object}
 */
export const useTableModals = (initialModals = {}, behaviorConfig = {}) => {
    const [modales, setModales] = useState(initialModals);
    const [itemEditando, setItemEditando] = useState(null);
    const [itemViendo, setItemViendo] = useState(null);

    /**
     * Abre un modal específico y asigna el ítem correspondiente según la clave del modal.
     */
    const handleOpenModal = useCallback((modalKey, payload = null) => {
        setModales((prev) => ({
            ...prev,
            [modalKey]: true,
        }));

        // Inyección de dependencias: El comportamiento se define mediante configuración externa
        const behavior = behaviorConfig[modalKey];
        if (behavior === 'edit') setItemEditando(payload);
        if (behavior === 'view') setItemViendo(payload);
    }, [behaviorConfig]);

    /**
     * Cierra un modal y limpia los estados de los ítems editando/viendo.
     */
    const handleCloseModal = useCallback((modalKey) => {
        setModales((prev) => ({
            ...prev,
            [modalKey]: false,
        }));

        const behavior = behaviorConfig[modalKey];
        if (behavior === 'edit') setItemEditando(null);
        if (behavior === 'view') setItemViendo(null);
    }, [behaviorConfig]);

    return {
        modales,
        setModales,
        itemEditando,
        setItemEditando,
        itemViendo,
        setItemViendo,
        handleOpenModal,
        handleCloseModal,
    };
};
