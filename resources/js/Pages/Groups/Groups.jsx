import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Layers3, Plus, ToggleRight, UsersRound, Trash2, Edit2 } from "lucide-react";

import ThemeButton from "@/Components/ThemeButton";
import GroupDetailsModal from "@/Components/Charts/GroupDetailsModal";
import CardGroup from "@/Components/Charts/CardGroup";
import ResourceFilterBar from "@/Components/Resource/ResourceFilterBar";
import ResourceSelectFilter from "@/Components/Resource/ResourceSelectFilter";
import GroupModal from "./FormModals/GroupModal";
import ModalAlert from "@/Components/ui/ModalAlert";
import ConfirmModal from "@/Components/ConfirmModal";
import useFlashAlert from "@/Hooks/useFlashAlert";

// Nuevos componentes genéricos importados
import DataGrid from "@/Components/DataTable/DataGrid";
import BulkActionBar from "@/Components/DataTable/BulkActionBar";
import { useGroupsManagement } from "@/Hooks/useGroupsManagement";

/**
 * Componente principal para el Catálogo de Grupos.
 * Actúa como una Vista limpia que delega su estado de negocio y lógica de
 * interacción al custom hook `useGroupsManagement`.
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
    // 1. Hook Composition para lógica empresarial
    const manager = useGroupsManagement(grupos);
    const { flashModal, closeFlashModal } = useFlashAlert();

    // 2. Estados locales de Interfaz para "Bulk Actions"
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState("");

    const esAdminOCoord = auth.user.roles.some(
        (r) => r.name === "admin" || r.name === "coordinator"
    );

    // Callbacks de confirmación puros
    const confirmDelete = () => {
        manager.handleBulkDelete();
        setIsDeleteModalOpen(false);
    };

    const confirmStatus = () => {
        manager.handleBulkStatus(pendingStatus);
        setIsStatusModalOpen(false);
        setPendingStatus("");
    };

    const handleStatusSelect = (e) => {
        const newStatus = e.target.value;
        if (!newStatus) return;
        setPendingStatus(newStatus);
        setIsStatusModalOpen(true);
        e.target.value = ""; // reset for next selection
    };

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
                                onClick={() => manager.handleOpenModal("formulario")}
                            >
                                Crear Grupo
                            </ThemeButton>
                        </div>
                    )}

                    {/* Filtros de Búsqueda */}
                    {(grupos.length > 0 || esAdminOCoord) && (
                        <ResourceFilterBar
                            busqueda={manager.busqueda}
                            setBusqueda={manager.setBusqueda}
                            searchPlaceholder="Buscar grupo, docente, horario o alumno..."
                            totalFiltrados={manager.itemsFiltrados.length}
                            resultSingularLabel="Grupo encontrado"
                            resultPluralLabel="Grupos encontrados"
                        >
                            <ResourceSelectFilter
                                icon={ToggleRight}
                                value={manager.filtrosAdicionales.estado}
                                onChange={(e) => manager.setFiltroAdicional("estado", e.target.value)}
                                ariaLabel="Filtrar por estado"
                                minWidthClassName="min-w-[180px]"
                                placeholder="Todos los estados"
                                options={statuses}
                            />

                            <ResourceSelectFilter
                                icon={Layers3}
                                value={manager.filtrosAdicionales.nivel}
                                onChange={(e) => manager.setFiltroAdicional("nivel", e.target.value)}
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
                                value={manager.filtrosAdicionales.ordenCupo || ""}
                                onChange={(e) => manager.setFiltroAdicional("ordenCupo", e.target.value || null)}
                                ariaLabel="Ordenar por disponibilidad"
                                minWidthClassName="min-w-[220px]"
                                placeholder="Orden: Por defecto"
                                options={[
                                    { value: "desc", label: "Disponibilidad: Alta a Baja" },
                                    { value: "asc", label: "Disponibilidad: Baja a Alta" },
                                ]}
                            />
                        </ResourceFilterBar>
                    )}

                    {/* Barra de Acciones en Lote (Inyección vía children) */}
                    {esAdminOCoord && manager.seleccionados.length > 0 && (
                        <BulkActionBar
                            selectedCount={manager.seleccionados.length}
                            onClearSelection={manager.clearSelection}
                            selectedSingularLabel="Grupo seleccionado"
                            selectedPluralLabel="Grupos seleccionados"
                        >
                            {/* Inyectamos acciones específicas de Grupos */}
                            <div className="flex bg-white/50 border border-gray-200 rounded-lg overflow-hidden">
                                <span className="flex items-center px-3 text-gray-500 bg-white border-r">
                                    <Edit2 size={16} />
                                </span>
                                <select 
                                    onChange={handleStatusSelect} 
                                    defaultValue="" 
                                    className="border-none py-2 text-sm focus:ring-0 cursor-pointer"
                                >
                                    <option value="" disabled>Cambiar Estado</option>
                                    {statuses.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            <ThemeButton theme="danger" icon={Trash2} onClick={() => setIsDeleteModalOpen(true)}>
                                Eliminar
                            </ThemeButton>
                        </BulkActionBar>
                    )}

                    {/* Grilla de Resultados Genérica (OCP mediante renderCard) */}
                    <DataGrid
                        data={manager.itemsPaginados}
                        hayFiltros={manager.hayFiltros}
                        paginaActual={manager.paginaActual}
                        totalPaginas={manager.totalPaginas}
                        onPageChange={manager.setPaginaActual}
                        emptyTitle="Sin grupos registrados"
                        emptyMessage="Aun no hay grupos registrados en el sistema."
                        emptyFilteredTitle="No hay resultados"
                        emptyFilteredMessage="No encontramos ningun grupo que coincida con los filtros seleccionados."
                        renderCard={(group) => (
                            <CardGroup
                                grupo={group}
                                seleccionado={manager.seleccionados.includes(group.id)}
                                onToggleSelect={manager.toggleSelect}
                                onVerDetalles={(g) => manager.handleOpenModal("detalles", g)}
                                onInscribir={() => manager.handleEnroll(group.id)}
                                onEditar={(g) => manager.handleOpenModal("formulario", g)}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Modales de Interacción */}
            <GroupDetailsModal
                grupo={manager.itemViendo}
                onClose={() => manager.handleCloseModal("detalles")}
            />

            <GroupModal
                    manager={manager}
                    levels={levels}
                    teachers={teachers}
                    periods={periods}
                    statuses={statuses}
                    modes={modes}
                    types={types}
                />

            {/* Modales Confirmaciones de Bulk */}
            <ConfirmModal
                isOpen={isStatusModalOpen}
                onClose={() => { setIsStatusModalOpen(false); setPendingStatus(""); }}
                onConfirm={confirmStatus}
                title="Actualizar estado de grupos"
                message={`¿Deseas cambiar el estado de ${manager.seleccionados.length} grupos a "${statuses.find(s => s.value === pendingStatus)?.label || pendingStatus}"?`}
                confirmText="Sí, actualizar"
                variant="institutional"
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Grupos"
                message={`¿Estas seguro de que deseas eliminar ${manager.seleccionados.length} grupos? Esta accion no se puede deshacer.`}
                confirmText="Sí, eliminar"
                variant="warning"
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
