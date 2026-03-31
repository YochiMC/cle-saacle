import { useState, useCallback } from "react";
import { router } from "@inertiajs/react";
import { useCatalogData } from "./useCatalogData";
import { filterGroups } from "@/Pages/Test_MK2/groupFilters";

/**
 * Hook Empresarial para la Gestión de Grupos (Hook Composition).
 * Orquesta internamente `useCatalogData` y le añade la lógica
 * específica de negocio: Modales de UI, y Peticiones API (Inertia).
 *
 * @param {Array} grupos - Datos iniciales de los grupos provistos por el backend.
 */
export const useGroupsManagement = (grupos = []) => {
    // 1. Composición: Estado base de Grid usando useCatalogData
    const catalog = useCatalogData({
        initialData: grupos,
        filterFunction: filterGroups,
        initialFilters: {
            estado: "",
            nivel: "",
            ordenCupo: null,
        },
    });

    // 2. Estados Específicos de Negocio (Modales)
    const [modales, setModales] = useState({
        formulario: false,
        detalles: false,
    });
    const [itemEditando, setItemEditando] = useState(null);
    const [itemViendo, setItemViendo] = useState(null);

    const handleOpenModal = useCallback((type, payload = null) => {
        setModales((prev) => ({ ...prev, [type]: true }));
        if (type === "formulario") setItemEditando(payload);
        if (type === "detalles") setItemViendo(payload);
    }, []);

    const handleCloseModal = useCallback((type) => {
        setModales((prev) => ({ ...prev, [type]: false }));
        if (type === "formulario") setItemEditando(null);
        if (type === "detalles") setItemViendo(null);
    }, []);

    // 3. Peticiones de Negocio (Inertia API)
    const handleBulkStatus = useCallback(
        (nuevoEstado) => {
            if (!nuevoEstado || catalog.seleccionados.length === 0) return;
            router.put(
                route("groups.bulk-status"),
                { ids: catalog.seleccionados, new_status: nuevoEstado },
                {
                    onSuccess: () => catalog.clearSelection(),
                }
            );
        },
        [catalog]
    );

    const handleBulkDelete = useCallback(() => {
        if (catalog.seleccionados.length === 0) return;
        router.delete(route("groups.bulk-delete"), {
            data: { ids: catalog.seleccionados },
            onSuccess: () => catalog.clearSelection(),
        });
    }, [catalog]);

    const handleEnroll = useCallback((id) => {
        router.post(route("groups.enroll", id), {}, { preserveScroll: true });
    }, []);

    // Exportar todo ensamblado
    return {
        // Spread del catálogo genérico (para mantener APIs similares)
        ...catalog,
        
        // Modales
        modales,
        itemEditando,
        itemViendo,
        handleOpenModal,
        handleCloseModal,
        
        // Acciones CRUD Bulk
        handleBulkStatus,
        handleBulkDelete,
        handleEnroll,
    };
};
