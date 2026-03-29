import { useState, useMemo, useCallback } from "react";
import { router } from "@inertiajs/react";

/**
 * Genera la clave legible del examen para poder buscarla.
 * Formato: {AbrevTipo}-{Mes3Letras}{Año2Dígitos}
 */
const generarClave = (examen) => {
    const tipo  = examen.exam_type?.value ?? examen.exam_type ?? "";
    const fecha = examen.application_date ?? "";

    const abrevTipo = {
        "Convalidación":     "CONV",
        "Planes anteriores": "PLAN",
        "4 habilidades":     "4HAB",
        "Ubicación":         "UBI",
    }[tipo] ?? tipo.substring(0, 4).toUpperCase();

    if (!fecha) return `${abrevTipo}-???`;

    const [year, month] = fecha.split("-");
    const meses   = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const mesStr  = meses[parseInt(month, 10) - 1] ?? "???";
    const anioStr = (year ?? "").slice(-2);

    return `${abrevTipo}-${mesStr}${anioStr}`;
};

/**
 * Hook personalizado para la gestión integral del estado de la vista de Exámenes.
 * Clon estructural de useGroupsManagement: centraliza filtrado, búsqueda,
 * selección múltiple y control de modales. Reemplaza filtroNivel por filtroTipo.
 *
 * @param {Object} params
 * @param {Array}  params.exams              - Lista completa de exámenes desde el servidor.
 * @param {number} [params.elementosPorPagina=12] - Elementos a mostrar por página.
 * @returns {Object} Estado, datos calculados y handlers memoizados.
 */
export const useExamsManagement = ({ exams = [], elementosPorPagina = 12 }) => {
    // ── Estados de filtrado y búsqueda ──────────────────────────────────────────
    const [busqueda, setBusqueda]         = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroTipo, setFiltroTipo]     = useState("");   // reemplaza filtroNivel
    const [ordenCupo, setOrdenCupo]       = useState(null);

    // ── Estados de navegación y selección ──────────────────────────────────────
    const [paginaActual, setPaginaActual]             = useState(1);
    const [examenesSeleccionados, setExamenesSeleccionados] = useState([]);

    // ── Estados de modales ──────────────────────────────────────────────────────
    const [modalAbierto, setModalAbierto]   = useState(false);
    const [examenEditando, setExamenEditando] = useState(null);
    const [examenViendo, setExamenViendo]   = useState(null);

    /**
     * Lógica de filtrado y ordenamiento memoizada.
     * Reinicia la página a 1 cada vez que cambia algún filtro.
     */
    const examenesFiltrados = useMemo(() => {
        setPaginaActual(1);

        const consulta = busqueda.toLowerCase();

        const filtrados = exams.filter((e) => {
            // Filtro por texto (nombre del examen o nombre del evaluador)
            if (consulta) {
                const nombre    = (e.name || "").toLowerCase();
                const clave     = generarClave(e).toLowerCase();
                const evaluador = (e.teacher_name ?? e.teacher?.full_name ?? "").toLowerCase();
                const aula      = (e.classroom || "").toLowerCase();
                const fecha     = (e.application_date || "").toLowerCase();
                if (
                    !nombre.includes(consulta) &&
                    !clave.includes(consulta) &&
                    !evaluador.includes(consulta) &&
                    !aula.includes(consulta) &&
                    !fecha.includes(consulta)
                ) {
                    return false;
                }
            }

            // Filtro por estado exacto (coincidencia con el valor del Enum)
            if (filtroEstado && (e.status || "").toLowerCase() !== filtroEstado.toLowerCase()) {
                return false;
            }

            // exam_type puede llegar como string o como Enum {value}
            const tipoExamen = e.exam_type?.value ?? e.exam_type ?? "";
            if (filtroTipo && tipoExamen !== filtroTipo) {
                return false;
            }

            return true;
        });

        // Ordenamiento por disponibilidad (usando available_seats ya calculado por el backend)
        if (ordenCupo === "asc") {
            filtrados.sort((a, b) => {
                const dispA = a.available_seats ?? ((a.capacity ?? 0) - (a.enrolled_count ?? 0));
                const dispB = b.available_seats ?? ((b.capacity ?? 0) - (b.enrolled_count ?? 0));
                return dispA - dispB;
            });
        } else if (ordenCupo === "desc") {
            filtrados.sort((a, b) => {
                const dispA = a.available_seats ?? ((a.capacity ?? 0) - (a.enrolled_count ?? 0));
                const dispB = b.available_seats ?? ((b.capacity ?? 0) - (b.enrolled_count ?? 0));
                return dispB - dispA;
            });
        }

        return filtrados;
    }, [exams, busqueda, filtroEstado, filtroTipo, ordenCupo]);

    // ── Cálculos de paginación ──────────────────────────────────────────────────
    const totalPaginas = useMemo(() =>
        Math.max(1, Math.ceil(examenesFiltrados.length / elementosPorPagina)),
    [examenesFiltrados.length, elementosPorPagina]);

    const examenesPaginados = useMemo(() =>
        examenesFiltrados.slice(
            (paginaActual - 1) * elementosPorPagina,
            paginaActual * elementosPorPagina
        ),
    [examenesFiltrados, paginaActual, elementosPorPagina]);

    const hayFiltros = useMemo(() =>
        busqueda !== "" || filtroEstado !== "" || filtroTipo !== "" || ordenCupo !== null,
    [busqueda, filtroEstado, filtroTipo, ordenCupo]);

    // ── Handlers de UI memoizados ───────────────────────────────────────────────
    const handleToggleSelect = useCallback((id) => {
        setExamenesSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((eId) => eId !== id) : [...prev, id]
        );
    }, []);

    const handleClearSelection = useCallback(() => {
        setExamenesSeleccionados([]);
    }, []);

    const handleCrearExamen = useCallback(() => {
        setExamenEditando(null);
        setModalAbierto(true);
    }, []);

    const handleEditar = useCallback((examen) => {
        setExamenEditando(examen);
        setModalAbierto(true);
    }, []);

    const handleCerrarModal = useCallback(() => {
        setModalAbierto(false);
        setExamenEditando(null);
    }, []);

    const handleVerDetalles = useCallback((examen) => setExamenViendo(examen), []);
    const handleCerrarDetalles = useCallback(() => setExamenViendo(null), []);

    // ── Acciones de negocio (Integración con Inertia) ──────────────────────────
    const handleInscripcion = useCallback((id) => {
        router.post(route("exams.enroll", id), {}, {
            preserveScroll: true,
        });
    }, []);

    const handleBulkStatus = useCallback((nuevoEstado) => {
        if (!nuevoEstado || examenesSeleccionados.length === 0) return;
        router.post(route("exams.bulk-status"), {
            ids: examenesSeleccionados,
            new_status: nuevoEstado,
        }, {
            onSuccess: () => handleClearSelection(),
        });
    }, [examenesSeleccionados, handleClearSelection]);

    const handleBulkDelete = useCallback(() => {
        if (examenesSeleccionados.length === 0) return;
        router.delete(route("exams.bulk-delete"), {
            data: { ids: examenesSeleccionados },
            onSuccess: () => handleClearSelection(),
        });
    }, [examenesSeleccionados, handleClearSelection]);

    // ── API pública del hook ────────────────────────────────────────────────────
    return {
        // Estados de filtros
        busqueda, setBusqueda,
        filtroEstado, setFiltroEstado,
        filtroTipo, setFiltroTipo,
        ordenCupo, setOrdenCupo,

        // Navegación y selección
        paginaActual, setPaginaActual,
        examenesSeleccionados,

        // Modales
        modalAbierto,
        examenEditando,
        examenViendo,

        // Datos calculados
        examenesFiltrados,
        totalPaginas,
        examenesPaginados,
        hayFiltros,

        // Handlers de UI
        handleToggleSelect,
        handleClearSelection,
        handleCrearExamen,
        handleEditar,
        handleCerrarModal,
        handleVerDetalles,
        handleCerrarDetalles,

        // Handlers de acciones
        handleInscripcion,
        handleBulkStatus,
        handleBulkDelete,
    };
};
