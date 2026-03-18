import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import GroupDetailsModal from "@/Components/Charts/GroupDetailsModal";
import GroupFilters from "./GroupFilters";
import GroupGrid from "./GroupGrid";
import BulkActionBar from "./BulkActionBar";
import ThemeButton from "@/Components/ThemeButton";
import { Plus } from "lucide-react";
import useFlashAlert from "@/Hooks/useFlashAlert";
import GroupModal from "@/Pages/Test_MK2/FormModals/GroupModal";
import ModalAlert from "@/Components/ui/ModalAlert";
import { useGroupsManagement } from "@/Hooks/useGroupsManagement";

/**
 * Componente principal para el Catálogo de Grupos.
 * Actúa como un contenedor ligero que delega la lógica de negocio al hook useGroupsManagement
 * y la representación visual a componentes especializados.
 * 
 * @component
 * @param {Object} props - Propiedades del componente de Inertia.
 * @param {Object} props.auth - Datos de autenticación.
 * @param {Array} props.grupos - Lista de grupos sincronizada desde el backend.
 * @param {Array} props.levels - Catálogo de niveles académicos.
 * @param {Array} props.teachers - Catálogo de docentes.
 * @param {Array} props.periods - Catálogo de periodos escolares.
 * @param {Array} props.statuses - Mapeo de estados del Enum GroupStatus.
 */
export default function Groups({ 
    auth, 
    grupos = [], 
    levels = [], 
    teachers = [], 
    periods = [], 
    statuses = [] 
}) {
    // Inicialización del Hook de Gestión
    const {
        busqueda, setBusqueda,
        filtroEstado, setFiltroEstado,
        filtroNivel, setFiltroNivel,
        ordenCupo, setOrdenCupo,
        paginaActual, setPaginaActual,
        gruposSeleccionados,
        modalAbierto,
        grupoEditando,
        grupoViendo,
        totalPaginas,
        gruposPaginados,
        gruposFiltrados,
        hayFiltros,
        handleToggleSelect,
        handleClearSelection,
        handleCrearGrupo,
        handleEditar,
        handleCerrarModal,
        handleVerDetalles,
        handleCerrarDetalles,
        handleInscripcion,
        handleBulkStatus,
        handleBulkDelete
    } = useGroupsManagement({ grupos });

    const { flashModal, closeFlashModal } = useFlashAlert();

    // Lógica de permisos rápida
    const esAdminOCoord = 
        auth.user.roles.some(r => r.name === 'admin' || r.name === 'coordinator');

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
                    {/* Sección de Acciones Globales */}
                    {esAdminOCoord && (
                        <div className="mb-6">
                            <ThemeButton
                                theme="institutional"
                                icon={Plus}
                                onClick={handleCrearGrupo}
                            >
                                Crear Grupo
                            </ThemeButton>
                        </div>
                    )}

                    {/* Filtros de Búsqueda */}
                    {(grupos.length > 0 || esAdminOCoord) && (
                        <GroupFilters
                            busqueda={busqueda}
                            setBusqueda={setBusqueda}
                            filtroEstado={filtroEstado}
                            setFiltroEstado={setFiltroEstado}
                            filtroNivel={filtroNivel}
                            setFiltroNivel={setFiltroNivel}
                            levels={levels}
                            statuses={statuses}
                            totalFiltrados={gruposFiltrados.length}
                            ordenCupo={ordenCupo}
                            setOrdenCupo={setOrdenCupo}
                        />
                    )}

                    {/* Barra de Acciones en Lote (Solo Administrativa) */}
                    {gruposSeleccionados.length > 0 && esAdminOCoord && (
                        <BulkActionBar
                            seleccionados={gruposSeleccionados}
                            onClearSelection={handleClearSelection}
                            statuses={statuses}
                            onBulkStatus={handleBulkStatus}
                            onBulkDelete={handleBulkDelete}
                        />
                    )}

                    {/* Grilla de Resultados */}
                    <GroupGrid
                        gruposPaginados={gruposPaginados}
                        gruposSeleccionados={gruposSeleccionados}
                        onToggleSelect={handleToggleSelect}
                        hayFiltros={hayFiltros}
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        onPageChange={setPaginaActual}
                        onVerDetalles={handleVerDetalles}
                        onInscribir={handleInscripcion}
                        onEditar={handleEditar}
                    />
                </div>
            </div>

            {/* Modales de Interacción */}
            <GroupDetailsModal
                grupo={grupoViendo}
                onClose={handleCerrarDetalles}
            />

            <GroupModal
                show={modalAbierto}
                title={grupoEditando ? `Editar grupo: ${grupoEditando.name}` : 'Añadir grupo'}
                onClose={handleCerrarModal}
                grupoToEdit={grupoEditando}
                levels={levels}
                teachers={teachers}
                periods={periods}
                statuses={statuses}
            />


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
