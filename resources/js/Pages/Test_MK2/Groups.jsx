import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import GroupDetailsModal from "@/Components/Charts/GroupDetailsModal";
import CardGroup from "@/Components/Charts/CardGroup";
import ResourceFilterBar from "@/Components/Resource/ResourceFilterBar";
import ResourceGrid from "@/Components/Resource/ResourceGrid";
import ResourceBulkActionBar from "@/Components/Resource/ResourceBulkActionBar";
import ResourceSelectFilter from "@/Components/Resource/ResourceSelectFilter";
import ThemeButton from "@/Components/ThemeButton";
import { Layers3, Plus, ToggleRight, UsersRound } from "lucide-react";
import useFlashAlert from "@/Hooks/useFlashAlert";
import GroupModal from "@/Pages/Test_MK2/FormModals/GroupModal";
import ModalAlert from "@/Components/ui/ModalAlert";
import { useResourceManagement } from "@/Hooks/useResourceManagement";
import { filterGroups } from "./groupFilters";

/**
 * Componente principal para el Catálogo de Grupos.
 * Actúa como un contenedor que delega la lógica de negocio al hook genérico
 * de recursos y la representación visual a componentes reutilizables.
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
    statuses = [],
    modes = [],
    types = [],
}) {
    const {
        busqueda,
        setBusqueda,
        paginaActual,
        setPaginaActual,
        seleccionados,
        modales,
        itemEditando,
        itemViendo,
        totalPaginas,
        itemsPaginados,
        itemsFiltrados,
        hayFiltros,
        filtros,
        handleSetFiltro,
        handleToggleSelect,
        handleClearSelection,
        handleOpenModal,
        handleCloseModal,
        handleBulkStatus,
        handleBulkDelete,
        handleAction,
    } = useResourceManagement({
        items: grupos,
        filterCallback: filterGroups,
        routes: {
            enroll: (id) => route("groups.enroll", id),
            bulkStatus: "groups.bulk-status",
            bulkStatusMethod: "put",
            bulkDelete: "groups.bulk-delete",
        },
        initialFilters: {
            estado: "",
            nivel: "",
            ordenCupo: null,
        },
    });

    const filtroEstado = filtros.estado ?? "";
    const filtroNivel = filtros.nivel ?? "";
    const ordenCupo = filtros.ordenCupo ?? null;

    const setFiltroEstado = (value) => handleSetFiltro("estado", value);
    const setFiltroNivel = (value) => handleSetFiltro("nivel", value);
    const setOrdenCupo = (value) => handleSetFiltro("ordenCupo", value);

    const handleCrearGrupo = () => handleOpenModal("formulario", null);
    const handleEditar = (group) => handleOpenModal("formulario", group);
    const handleCerrarModal = () => handleCloseModal("formulario");

    const handleVerDetalles = (group) => handleOpenModal("detalles", group);
    const handleCerrarDetalles = () => handleCloseModal("detalles");

    const handleInscripcion = (id) => {
        handleAction("enroll", {
            routeParams: [id],
            options: {
                preserveScroll: true,
            },
        });
    };

    const { flashModal, closeFlashModal } = useFlashAlert();

    // Lógica de permisos rápida
    const esAdminOCoord = auth.user.roles.some(
        (r) => r.name === "admin" || r.name === "coordinator",
    );

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
                        <ResourceFilterBar
                            busqueda={busqueda}
                            setBusqueda={setBusqueda}
                            searchPlaceholder="Buscar por grupo, docente o nivel..."
                            totalFiltrados={itemsFiltrados.length}
                            resultSingularLabel="Grupo encontrado"
                            resultPluralLabel="Grupos encontrados"
                        >
                            <ResourceSelectFilter
                                icon={ToggleRight}
                                value={filtroEstado}
                                onChange={(e) =>
                                    setFiltroEstado(e.target.value)
                                }
                                ariaLabel="Filtrar por estado"
                                minWidthClassName="min-w-[180px]"
                                placeholder="Todos los estados"
                                options={statuses}
                            />

                            <ResourceSelectFilter
                                icon={Layers3}
                                value={filtroNivel}
                                onChange={(e) => setFiltroNivel(e.target.value)}
                                ariaLabel="Filtrar por nivel"
                                minWidthClassName="min-w-[200px]"
                                placeholder="Todos los niveles"
                                options={levels.map((nivel) => ({
                                    value: String(nivel.id),
                                    label: nivel.level_tecnm || nivel.name,
                                }))}
                            />

                            <ResourceSelectFilter
                                icon={UsersRound}
                                value={ordenCupo || ""}
                                onChange={(e) =>
                                    setOrdenCupo(e.target.value || null)
                                }
                                ariaLabel="Ordenar por disponibilidad"
                                minWidthClassName="min-w-[220px]"
                                placeholder="Orden: Por defecto"
                                options={[
                                    {
                                        value: "desc",
                                        label: "Disponibilidad: Alta a Baja",
                                    },
                                    {
                                        value: "asc",
                                        label: "Disponibilidad: Baja a Alta",
                                    },
                                ]}
                            />
                        </ResourceFilterBar>
                    )}

                    {/* Barra de Acciones en Lote (Solo Administrativa) */}
                    {seleccionados.length > 0 && esAdminOCoord && (
                        <ResourceBulkActionBar
                            seleccionados={seleccionados}
                            onClearSelection={handleClearSelection}
                            statuses={statuses}
                            onBulkStatus={(newStatus) =>
                                handleBulkStatus(newStatus)
                            }
                            onBulkDelete={() => handleBulkDelete()}
                            selectedSingularLabel="Grupo seleccionado"
                            selectedPluralLabel="Grupos seleccionados"
                            statusPlaceholder="Cambiar Estado"
                            confirmStatusChange={true}
                            statusModalTitle="Actualizar estado de grupos"
                            statusModalMessage={(count, statusLabel) =>
                                `¿Deseas cambiar el estado de ${count} grupos a \"${statusLabel}\"?`
                            }
                            statusConfirmText="Sí, actualizar"
                            deleteButtonText="Eliminar"
                            deleteModalTitle="Eliminar Grupos"
                            deleteModalMessage={(count) =>
                                `¿Estas seguro de que deseas eliminar ${count} grupos? Esta accion no se puede deshacer.`
                            }
                        />
                    )}

                    {/* Grilla de Resultados */}
                    <ResourceGrid
                        items={itemsPaginados}
                        CardComponent={CardGroup}
                        getCardProps={(group) => ({
                            grupo: group,
                            seleccionado: seleccionados.includes(group.id),
                            onToggleSelect: handleToggleSelect,
                            onVerDetalles: handleVerDetalles,
                            onInscribir: handleInscripcion,
                            onEditar: handleEditar,
                        })}
                        getItemKey={(group) => group.id}
                        hayFiltros={hayFiltros}
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        onPageChange={setPaginaActual}
                        emptyTitle="Sin grupos registrados"
                        emptyMessage="Aun no hay grupos registrados en el sistema."
                        emptyFilteredTitle="No hay resultados"
                        emptyFilteredMessage="No encontramos ningun grupo que coincida con los filtros seleccionados."
                    />
                </div>
            </div>

            {/* Modales de Interacción */}
            <GroupDetailsModal
                grupo={itemViendo}
                onClose={handleCerrarDetalles}
            />

            <GroupModal
                show={modales.formulario}
                title={
                    itemEditando
                        ? `Editar grupo: ${itemEditando.name}`
                        : "Añadir grupo"
                }
                onClose={handleCerrarModal}
                grupoToEdit={itemEditando}
                levels={levels}
                teachers={teachers}
                periods={periods}
                statuses={statuses}
                modes={modes}
                types={types}
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
