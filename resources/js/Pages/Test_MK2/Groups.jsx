import React, { useState, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import GroupDetailsModal from "@/Components/Charts/GroupDetailsModal";
import GroupFilters from "./GroupFilters";
import GroupGrid from "./GroupGrid";
import ThemeButton from "@/Components/ThemeButton";
import { Plus, Settings } from "lucide-react";

const ITEMS_POR_PAGINA = 12;

/**
 * Componente contenedor para el catálogo de grupos.
 * Gestiona el estado local y la lógica de filtrado global para la vista.
 *
 * @param {Object} props
 * @param {Object} props.auth - Usuario autenticado actualmente.
 * @param {Array<Object>} [props.grupos=[]] - Lista de grupos provenientes del servidor.
 * @param {Array<Object>} [props.levels=[]] - Catálogo de niveles académicos.
 */
export default function Groups({ auth, grupos = [], levels = [] }) {
    const [busqueda, setBusqueda] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterLevel, setFilterLevel] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

    const roles = auth?.roles ?? [];
    const esAdminOCoord = roles.includes("admin") || roles.includes("coordinator");

    const gruposFiltrados = useMemo(() => {
        setPaginaActual(1);

        const q = busqueda.toLowerCase();

        return grupos.filter((g) => {
            if (q) {
                const nombre = (g.name || "").toLowerCase();
                const maestro = (g.teacher_name || "").toLowerCase();
                const nivel = (g.level?.level_tecnm || "").toLowerCase();

                const pasaTexto = nombre.includes(q) || maestro.includes(q) || nivel.includes(q);
                if (!pasaTexto) return false;
            }

            if (filterStatus) {
                const statusGrupo = (g.status || "").toLowerCase();
                const statusNormalizado =
                    statusGrupo === "pending" ? "waiting" : statusGrupo;

                if (statusNormalizado !== filterStatus) return false;
            }

            if (filterLevel) {
                if (String(g.level?.id) !== filterLevel) return false;
            }

            return true;
        });
    }, [grupos, busqueda, filterStatus, filterLevel]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(gruposFiltrados.length / ITEMS_POR_PAGINA),
    );
    const gruposPaginados = gruposFiltrados.slice(
        (paginaActual - 1) * ITEMS_POR_PAGINA,
        paginaActual * ITEMS_POR_PAGINA,
    );

    const handleInscripcion = (_grupoId) => {
        alert("Inscripción en construcción.");
    };

    const handleEditar = (grupo) => {
        alert("Abriendo formulario de edición para: " + grupo.name);
    };

    const hayFiltros = busqueda !== "" || filterStatus !== "" || filterLevel !== "";
    const mostrarFiltros = grupos.length > 0 || esAdminOCoord;

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Catálogo de Grupos
                </h2>
            }
        >
            <Head title="Catálogo de Grupos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Controles Administrativos */}
                    {esAdminOCoord && (
                        <div className="mb-6 flex flex-wrap items-center gap-4">
                            <ThemeButton
                                theme="institutional"
                                icon={Plus}
                                onClick={() => alert("Abrir modal de creación")}
                            >
                                Crear Grupo
                            </ThemeButton>
                            <ThemeButton
                                theme="outline"
                                icon={Settings}
                                onClick={() => alert("Abrir modal para cambiar settings")}
                            >
                                Configurar Fecha de Inscripción
                            </ThemeButton>
                        </div>
                    )}

                    {mostrarFiltros && (
                        <GroupFilters
                            busqueda={busqueda}
                            setBusqueda={setBusqueda}
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            filterLevel={filterLevel}
                            setFilterLevel={setFilterLevel}
                            levels={levels}
                            totalFiltrados={gruposFiltrados.length}
                        />
                    )}

                    <GroupGrid
                        gruposPaginados={gruposPaginados}
                        hayFiltros={hayFiltros}
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        onPageChange={setPaginaActual}
                        auth={auth}
                        onVerDetalles={setGrupoSeleccionado}
                        onInscribir={handleInscripcion}
                        onEditar={handleEditar}
                    />
                </div>
            </div>

            <GroupDetailsModal
                grupo={grupoSeleccionado}
                onClose={() => setGrupoSeleccionado(null)}
            />
        </AuthenticatedLayout>
    );
}
