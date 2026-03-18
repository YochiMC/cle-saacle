import { useState, useMemo, useCallback } from "react";
import { router } from "@inertiajs/react";

/**
 * Hook personalizado para la gestión integral del estado de la vista de Grupos.
 * Centraliza la lógica de filtrado, búsqueda, selección múltiple y control de modales.
 * 
 * @param {Object} params - Parámetros iniciales.
 * @param {Array} params.grupos - Lista completa de grupos desde el servidor.
 * @param {number} [params.elementosPorPagina=12] - Cantidad de elementos a mostrar por página.
 * @returns {Object} Estado y manejadores de eventos memoizados.
 */
export const useGroupsManagement = ({ grupos = [], elementosPorPagina = 12 }) => {
    // Estados de filtrado y búsqueda (Nomenclatura en Español)
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroNivel, setFiltroNivel] = useState("");
    const [ordenCupo, setOrdenCupo] = useState(null);

    // Estados de navegación y selección
    const [paginaActual, setPaginaActual] = useState(1);
    const [gruposSeleccionados, setGruposSeleccionados] = useState([]);

    // Estados de modales
    const [modalAbierto, setModalAbierto] = useState(false);
    const [grupoEditando, setGrupoEditando] = useState(null);
    const [grupoViendo, setGrupoViendo] = useState(null);

    /**
     * Lógica de filtrado y búsqueda memoizada para optimizar el rendimiento.
     */
    const gruposFiltrados = useMemo(() => {
        // Reiniciar a la primera página si cambian los filtros
        setPaginaActual(1);

        const consulta = busqueda.toLowerCase();

        const filtrados = grupos.filter((g) => {
            // Filtro por texto (Nombre, Docente o Nivel)
            if (consulta) {
                const nombre = (g.name || "").toLowerCase();
                const maestro = (g.teacher_name || "").toLowerCase();
                const nivel = (g.level?.level_tecnm || "").toLowerCase();

                if (!nombre.includes(consulta) && !maestro.includes(consulta) && !nivel.includes(consulta)) {
                    return false;
                }
            }

            // Filtro por Estado exacto del Enum
            if (filtroEstado && (g.status || "").toLowerCase() !== filtroEstado) {
                return false;
            }

            // Filtro por Nivel
            if (filtroNivel && String(g.level?.id) !== filtroNivel) {
                return false;
            }

            return true;
        });

        // Ordenamiento por disponibilidad
        if (ordenCupo === "asc") {
            filtrados.sort((a, b) => (a.available_seats || 0) - (b.available_seats || 0));
        } else if (ordenCupo === "desc") {
            filtrados.sort((a, b) => (b.available_seats || 0) - (a.available_seats || 0));
        }

        return filtrados;
    }, [grupos, busqueda, filtroEstado, filtroNivel, ordenCupo]);

    /**
     * Cálculos de paginación.
     */
    const totalPaginas = useMemo(() => 
        Math.max(1, Math.ceil(gruposFiltrados.length / elementosPorPagina)),
    [gruposFiltrados.length, elementosPorPagina]);

    const gruposPaginados = useMemo(() => 
        gruposFiltrados.slice((paginaActual - 1) * elementosPorPagina, paginaActual * elementosPorPagina),
    [gruposFiltrados, paginaActual, elementosPorPagina]);

    const hayFiltros = useMemo(() => 
        busqueda !== "" || filtroEstado !== "" || filtroNivel !== "" || ordenCupo !== null,
    [busqueda, filtroEstado, filtroNivel, ordenCupo]);

    /**
     * Handlers de eventos memoizados para evitar re-renders en componentes hijos.
     */
    const handleToggleSelect = useCallback((id) => {
        setGruposSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]
        );
    }, []);

    const handleClearSelection = useCallback(() => {
        setGruposSeleccionados([]);
    }, []);

    const handleCrearGrupo = useCallback(() => {
        setGrupoEditando(null);
        setModalAbierto(true);
    }, []);

    const handleEditar = useCallback((grupo) => {
        setGrupoEditando(grupo);
        setModalAbierto(true);
    }, []);

    const handleCerrarModal = useCallback(() => {
        setModalAbierto(false);
        setGrupoEditando(null);
    }, []);

    const handleVerDetalles = useCallback((grupo) => setGrupoViendo(grupo), []);
    const handleCerrarDetalles = useCallback(() => setGrupoViendo(null), []);

    /**
     * Acciones de Negocio (Integración con Inertia)
     */

    const handleInscripcion = useCallback((id) => {
        router.post(route('groups.enroll', id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Notificación o feedback visual puede ser manejado globalmente vía flash
            }
        });
    }, []);

    const handleBulkStatus = useCallback((nuevoEstado) => {
        if (!nuevoEstado || gruposSeleccionados.length === 0) return;
        
        router.post(route('groups.bulk-status'), {
            ids: gruposSeleccionados,
            new_status: nuevoEstado
        }, {
            onSuccess: () => handleClearSelection()
        });
    }, [gruposSeleccionados, handleClearSelection]);

    const handleBulkDelete = useCallback(() => {
        if (gruposSeleccionados.length === 0) return;

        router.delete(route('groups.bulk-delete'), {
            data: { ids: gruposSeleccionados },
            onSuccess: () => handleClearSelection()
        });
    }, [gruposSeleccionados, handleClearSelection]);

    return {
        // Estados
        busqueda, setBusqueda,
        filtroEstado, setFiltroEstado,
        filtroNivel, setFiltroNivel,
        ordenCupo, setOrdenCupo,
        paginaActual, setPaginaActual,
        gruposSeleccionados,
        modalAbierto,
        grupoEditando,
        grupoViendo,
        
        // Datos filtrados y calculados
        gruposFiltrados,
        totalPaginas,
        gruposPaginados,
        hayFiltros,

        // Handlers de UI
        handleToggleSelect,
        handleClearSelection,
        handleCrearGrupo,
        handleEditar,
        handleCerrarModal,
        handleVerDetalles,
        handleCerrarDetalles,

        // Handlers de Acciones (Post/Delete)
        handleInscripcion,
        handleBulkStatus,
        handleBulkDelete
    };
};

