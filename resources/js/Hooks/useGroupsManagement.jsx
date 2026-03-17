import { useState, useMemo, useCallback } from "react";

/**
 * Hook personalizado para la gestión de la lógica de negocio del catálogo de grupos.
 * Centraliza el filtrado, búsqueda, ordenamiento, paginación y manejo de selección.
 * 
 * @param {Array<Object>} grupos - Lista inicial de grupos desde el servidor.
 * @param {number} itemsPorPagina - Cantidad de registros por página.
 * @returns {Object} Estados y funciones para controlar la vista de grupos.
 */
export function useGroupsManagement(grupos = [], itemsPorPagina = 12) {
    const [busqueda, setBusqueda] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterLevel, setFilterLevel] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [gruposSeleccionados, setGruposSeleccionados] = useState([]);
    const [ordenCupo, setOrdenCupo] = useState(null);

    // Estado para modales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [grupoEditando, setGrupoEditando] = useState(null);
    const [grupoViendo, setGrupoViendo] = useState(null);

    /**
     * Lógica de filtrado y ordenamiento memorizada.
     */
    const gruposFiltrados = useMemo(() => {
        // Resetear a la primera página al filtrar (opcional, pero recomendado)
        // Nota: No se puede llamar a setPaginaActual aquí directamente porque es un render side-effect.
        // Se maneja externamente o mediante useEffect si fuera necesario.

        const q = busqueda.toLowerCase();

        const filtrados = grupos.filter((g) => {
            // Filtro por texto (Nombre, Maestro, Nivel)
            if (q) {
                const nombre = (g.name || "").toLowerCase();
                const maestro = (g.teacher_name || "").toLowerCase();
                const nivel = (g.level?.level_tecnm || "").toLowerCase();

                if (!(nombre.includes(q) || maestro.includes(q) || nivel.includes(q))) {
                    return false;
                }
            }

            // Filtro por Estado
            if (filterStatus) {
                const statusGrupo = (g.status || "").toLowerCase();
                const statusNormalizado = statusGrupo === "pending" ? "waiting" : statusGrupo;
                if (statusNormalizado !== filterStatus) return false;
            }

            // Filtro por Nivel
            if (filterLevel && String(g.level?.id) !== filterLevel) {
                return false;
            }

            return true;
        });

        // Lógica de ordenamiento por cupo disponible
        if (ordenCupo) {
            filtrados.sort((a, b) => {
                const valA = a.available_seats || 0;
                const valB = b.available_seats || 0;
                return ordenCupo === "asc" ? valA - valB : valB - valA;
            });
        }

        return filtrados;
    }, [grupos, busqueda, filterStatus, filterLevel, ordenCupo]);

    /**
     * Paginación
     */
    const totalPaginas = Math.max(1, Math.ceil(gruposFiltrados.length / itemsPorPagina));
    const gruposPaginados = useMemo(() => {
        return gruposFiltrados.slice(
            (paginaActual - 1) * itemsPorPagina,
            paginaActual * itemsPorPagina
        );
    }, [gruposFiltrados, paginaActual, itemsPorPagina]);

    /**
     * Handlers de Selección
     */
    const handleToggleSelect = useCallback((id) => {
        setGruposSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]
        );
    }, []);

    const handleClearSelection = useCallback(() => setGruposSeleccionados([]), []);

    /**
     * Handlers de Modales
     */
    const handleOpenCreate = useCallback(() => {
        setGrupoEditando(null);
        setIsModalOpen(true);
    }, []);

    const handleOpenEdit = useCallback((grupo) => {
        setGrupoEditando(grupo);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setGrupoEditando(null);
    }, []);

    const handleOpenDetails = useCallback((grupo) => setGrupoViendo(grupo), []);
    const handleCloseDetails = useCallback(() => setGrupoViendo(null), []);

    return {
        // Estados
        busqueda, setBusqueda,
        filterStatus, setFilterStatus,
        filterLevel, setFilterLevel,
        paginaActual, setPaginaActual,
        gruposSeleccionados,
        ordenCupo, setOrdenCupo,
        isModalOpen,
        grupoEditando,
        grupoViendo,

        // Datos procesados
        gruposFiltrados,
        gruposPaginados,
        totalPaginas,
        hayFiltros: busqueda !== "" || filterStatus !== "" || filterLevel !== "" || ordenCupo !== null,

        // Funciones
        handleToggleSelect,
        handleClearSelection,
        handleOpenCreate,
        handleOpenEdit,
        handleCloseModal,
        handleOpenDetails,
        handleCloseDetails,
    };
}
