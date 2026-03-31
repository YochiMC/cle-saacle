import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import ThemeButton from "@/Components/ThemeButton";
import {
    CalendarX,
    ClipboardList,
    Plus,
    ToggleRight,
    Trash2,
    Edit2,
} from "lucide-react";
import { usePermission } from "@/Utils/auth";

import CardExam from "./CardExam";
import ExamDetailsModal from "./ExamDetailsModal";
import ExamFormModal from "./ExamFormModal";
import ResourceFilterBar from "@/Components/Resource/ResourceFilterBar";
import ResourceSelectFilter from "@/Components/Resource/ResourceSelectFilter";
import useFlashAlert from "@/Hooks/useFlashAlert";
import ModalAlert from "@/Components/ui/ModalAlert";
import ConfirmModal from "@/Components/ConfirmModal";

import DataGrid from "@/Components/DataTable/DataGrid";
import BulkActionBar from "@/Components/DataTable/BulkActionBar";
import { useExamsManagement } from "@/Hooks/useExamsManagement";

export default function Examen({
    auth,
    examenes = [],
    periods = [],
    students = [],
    teachers = [],
    levels = [],
}) {
    const { statuses = [], typeOptions = [] } = usePage().props;
    const periodOptions = periods.map((p) => ({
        value: String(p.id),
        label: p.name,
    }));
    const modeOptions = [
        { value: "Presencial", label: "Presencial" },
        { value: "Virtual", label: "Virtual" },
    ];

    // 1. Hook Composition para la Lógica de Negocio
    const manager = useExamsManagement(examenes);
    const { flashModal, closeFlashModal } = useFlashAlert();

    // 2. Estados locales de Interfaz para Opciones de "Bulk"
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState("");

    const { hasRole } = usePermission();
    const esAdminOCoord = hasRole("admin") || hasRole("coordinator");
    const exp_mostrarFiltros = examenes.length > 0 || esAdminOCoord;

    // Callbacks de confirmación
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
        e.target.value = "";
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Gestión de Exámenes
                </h2>
            }
        >
            <Head title="Gestión de Exámenes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {esAdminOCoord && (
                        <div className="mb-6 flex flex-wrap items-center gap-4">
                            <ThemeButton
                                theme="institutional"
                                icon={Plus}
                                onClick={() =>
                                    manager.handleOpenModal("formulario")
                                }
                            >
                                Crear Examen
                            </ThemeButton>
                        </div>
                    )}

                    {exp_mostrarFiltros && (
                        <ResourceFilterBar
                            busqueda={manager.busqueda}
                            setBusqueda={manager.setBusqueda}
                            searchPlaceholder="Buscar examen, docente, fechas o alumno..."
                            totalFiltrados={manager.itemsFiltrados.length}
                            resultSingularLabel="Examen encontrado"
                            resultPluralLabel="Exámenes encontrados"
                        >
                            <ResourceSelectFilter
                                icon={ToggleRight}
                                value={manager.filtrosAdicionales.estado || ""}
                                onChange={(e) =>
                                    manager.setFiltroAdicional(
                                        "estado",
                                        e.target.value,
                                    )
                                }
                                ariaLabel="Filtrar por estado"
                                minWidthClassName="min-w-[180px]"
                                placeholder="Todos los estados"
                                options={statuses}
                            />

                            <ResourceSelectFilter
                                icon={ClipboardList}
                                value={manager.filtrosAdicionales.period || ""}
                                onChange={(e) =>
                                    manager.setFiltroAdicional(
                                        "period",
                                        e.target.value,
                                    )
                                }
                                ariaLabel="Filtrar por periodo"
                                minWidthClassName="min-w-[200px]"
                                placeholder="Todos los periodos"
                                options={periodOptions}
                            />

                            <ResourceSelectFilter
                                icon={ToggleRight}
                                value={manager.filtrosAdicionales.mode || ""}
                                onChange={(e) =>
                                    manager.setFiltroAdicional(
                                        "mode",
                                        e.target.value,
                                    )
                                }
                                ariaLabel="Filtrar por modalidad"
                                minWidthClassName="min-w-[220px]"
                                placeholder="Todas las modalidades"
                                options={modeOptions}
                            />
                        </ResourceFilterBar>
                    )}

                    {esAdminOCoord && manager.seleccionados.length > 0 && (
                        <BulkActionBar
                            selectedCount={manager.seleccionados.length}
                            onClearSelection={manager.clearSelection}
                            selectedSingularLabel="Examen seleccionado"
                            selectedPluralLabel="Exámenes seleccionados"
                        >
                            <div className="flex bg-white/50 border border-gray-200 rounded-lg overflow-hidden">
                                <span className="flex items-center px-3 text-gray-500 bg-white border-r">
                                    <Edit2 size={16} />
                                </span>
                                <select
                                    onChange={handleStatusSelect}
                                    defaultValue=""
                                    className="border-none py-2 text-sm focus:ring-0 cursor-pointer"
                                >
                                    <option value="" disabled>
                                        Cambiar Estado
                                    </option>
                                    {statuses.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <ThemeButton
                                theme="danger"
                                icon={Trash2}
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                Eliminar
                            </ThemeButton>
                        </BulkActionBar>
                    )}

                    <DataGrid
                        data={manager.itemsPaginados}
                        hayFiltros={manager.hayFiltros}
                        paginaActual={manager.paginaActual}
                        totalPaginas={manager.totalPaginas}
                        onPageChange={manager.setPaginaActual}
                        EmptyIcon={CalendarX}
                        emptyTitle="Sin exámenes programados"
                        emptyMessage="Aún no hay exámenes registrados en el sistema."
                        emptyFilteredTitle="No hay resultados"
                        emptyFilteredMessage="Ajusta los filtros de búsqueda para encontrar sesiones de examen."
                        renderCard={(exam) => (
                            <CardExam
                                examen={exam}
                                seleccionado={manager.seleccionados.includes(
                                    exam.id,
                                )}
                                onToggleSelect={manager.toggleSelect}
                                onVerDetalles={(e) =>
                                    manager.handleOpenModal("detalles", e)
                                }
                                onInscribir={() =>
                                    manager.handleEnroll(exam.id)
                                }
                                onEditar={(e) =>
                                    manager.handleOpenModal("formulario", e)
                                }
                            />
                        )}
                    />
                </div>
            </div>

            {/* Modales Compartidos */}
            <ExamDetailsModal
                examen={manager.itemViendo}
                onClose={() => manager.handleCloseModal("detalles")}
            />

            <ExamFormModal
                manager={manager}
                periods={periods}
                typeOptions={typeOptions}
                teachers={teachers}
                statuses={statuses}
            />

            {/* Confirmaciones Bulk */}
            <ConfirmModal
                isOpen={isStatusModalOpen}
                onClose={() => {
                    setIsStatusModalOpen(false);
                    setPendingStatus("");
                }}
                onConfirm={confirmStatus}
                title="Actualizar estado de exámenes"
                message={`¿Deseas cambiar el estado de ${manager.seleccionados.length} exámenes a "${statuses.find((s) => s.value === pendingStatus)?.label || pendingStatus}"?`}
                confirmText="Sí, actualizar"
                variant="institutional"
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Exámenes"
                message={`¿Estas seguro de que deseas eliminar ${manager.seleccionados.length} exámenes? Esta acción no se puede deshacer.`}
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
