import React, { useState, useMemo, useCallback } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import GroupDetailsModal from "@/Components/Charts/GroupDetailsModal";
import GroupFilters from "./GroupFilters";
import GroupGrid from "./GroupGrid";
import BulkActionBar from "./BulkActionBar";
import ThemeButton from "@/Components/ThemeButton";
import { Plus } from "lucide-react";
import { usePermission } from "@/Utils/auth";
import useFlashAlert from "@/Hooks/useFlashAlert";
import GroupModal from "@/Pages/Test_MK2/FormModals/GroupModal";
import ModalAlert from "@/Components/ui/ModalAlert";

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
export default function Groups({ auth, grupos = [], levels = [], teachers = [], periods = [] }) {
    const [busqueda, setBusqueda] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterLevel, setFilterLevel] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
    const [ordenCupo, setOrdenCupo] = useState(null);
    const [gruposSeleccionados, setGruposSeleccionados] = useState([]);
    const { flashModal, closeFlashModal } = useFlashAlert();

    const { hasRole } = usePermission();
    const esAdminOCoord = hasRole("admin") || hasRole("coordinator");

    const gruposFiltrados = useMemo(() => {
        setPaginaActual(1);

        const q = busqueda.toLowerCase();

        const filtrados = grupos.filter((g) => {
            if (q) {
                const nombre = (g.name || "").toLowerCase();
                const maestro = (g.teacher_name || "").toLowerCase();
                const nivel = (g.level?.level_tecnm || "").toLowerCase();

                const pasaTexto =
                    nombre.includes(q) ||
                    maestro.includes(q) ||
                    nivel.includes(q);
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

        if (ordenCupo === "asc") {
            filtrados.sort(
                (a, b) => (a.available_seats || 0) - (b.available_seats || 0),
            );
        } else if (ordenCupo === "desc") {
            filtrados.sort(
                (a, b) => (b.available_seats || 0) - (a.available_seats || 0),
            );
        }

        return filtrados;
    }, [grupos, busqueda, filterStatus, filterLevel, ordenCupo]);

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

    const handleToggleSelect = useCallback((id) => {
        setGruposSeleccionados((prev) =>
            prev.includes(id)
                ? prev.filter((gId) => gId !== id)
                : [...prev, id],
        );
    }, []);

    const handleClearSelection = useCallback(() => {
        setGruposSeleccionados([]);
    }, []);

    const handleBulkChangeStatus = () => {
        alert(
            `Abrir modal para cambiar estado de ${gruposSeleccionados.length} grupos`,
        );
    };

    const handleBulkDelete = () => {
        alert(`Confirmar eliminación de ${gruposSeleccionados.length} grupos`);
    };

    const handleCrearGrupo = () => setIsModalOpen(true);

    const handleCerrarDetalles = () => setGrupoSeleccionado(null);

    const hayFiltros =
        busqueda !== "" ||
        filterStatus !== "" ||
        filterLevel !== "" ||
        ordenCupo !== null;
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
                                onClick={handleCrearGrupo}
                            >
                                Crear Grupo
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
                            ordenCupo={ordenCupo}
                            setOrdenCupo={setOrdenCupo}
                        />
                    )}

                    {/* Barra de Acciones en Lote Fija (Flotante) */}
                    {gruposSeleccionados.length > 0 && esAdminOCoord && (
                        <BulkActionBar
                            seleccionados={gruposSeleccionados}
                            onClearSelection={handleClearSelection}
                            onBulkStatus={handleBulkChangeStatus}
                            onBulkDelete={handleBulkDelete}
                        />
                    )}

                    <GroupGrid
                        gruposPaginados={gruposPaginados}
                        gruposSeleccionados={gruposSeleccionados}
                        onToggleSelect={handleToggleSelect}
                        hayFiltros={hayFiltros}
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        onPageChange={setPaginaActual}
                        onVerDetalles={setGrupoSeleccionado}
                        onInscribir={handleInscripcion}
                        onEditar={handleEditar}
                    />
                </div>
            </div>

            <GroupDetailsModal
                grupo={grupoSeleccionado}
                onClose={handleCerrarDetalles}
            />

            <GroupModal show={isModalOpen} title="Añadir grupo" onClose={() => setIsModalOpen(false)} levels={levels} teachers={teachers} periods={periods} />
            <ModalAlert
                isOpen={flashModal.isOpen}
                onClose={closeFlashModal}
                type={flashModal.type}
                title={flashModal.title}
                message={flashModal.message}
            />
        </AuthenticatedLayout>
    );
}
