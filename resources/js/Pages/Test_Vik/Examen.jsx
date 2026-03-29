import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import ThemeButton from "@/Components/ThemeButton";
import {
    CalendarX,
    ClipboardList,
    Plus,
    ToggleRight,
    UsersRound,
} from "lucide-react";
import { usePermission } from "@/Utils/auth";

import CardExam from "./CardExam";
import ExamDetailsModal from "./ExamDetailsModal";
import { useResourceManagement } from "@/Hooks/useResourceManagement";
import ResourceFilterBar from "@/Components/Resource/ResourceFilterBar";
import ResourceGrid from "@/Components/Resource/ResourceGrid";
import ResourceBulkActionBar from "@/Components/Resource/ResourceBulkActionBar";
import ResourceSelectFilter from "@/Components/Resource/ResourceSelectFilter";
import { filterExams } from "./examFilters";
import useFlashAlert from "@/Hooks/useFlashAlert";
import ModalAlert from "@/Components/ui/ModalAlert";

export default function Examen({
    auth,
    examenes = [],
    statuses = [],
    typeOptions = [],
}) {
    const {
        busqueda,
        setBusqueda,
        paginaActual,
        setPaginaActual,
        seleccionados,
        modales,
        itemViendo,
        itemsFiltrados,
        totalPaginas,
        itemsPaginados,
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
        items: examenes,
        filterCallback: filterExams,
        routes: {
            enroll: (id) => route("exams.enroll", id),
            bulkStatus: "exams.bulk-status",
            bulkStatusMethod: "put",
            bulkDelete: "exams.bulk-delete",
        },
        initialFilters: {
            estado: "",
            tipo: "",
            ordenCupo: null,
        },
    });

    const filtroEstado = filtros.estado ?? "";
    const filtroTipo = filtros.tipo ?? "";
    const ordenCupo = filtros.ordenCupo ?? null;

    const setFiltroEstado = (value) => handleSetFiltro("estado", value);
    const setFiltroTipo = (value) => handleSetFiltro("tipo", value);
    const setOrdenCupo = (value) => handleSetFiltro("ordenCupo", value);

    const handleCrearExamen = () => handleOpenModal("formulario", null);
    const handleEditar = (exam) => handleOpenModal("formulario", exam);
    const handleCerrarModal = () => handleCloseModal("formulario");

    const handleVerDetalles = (exam) => handleOpenModal("detalles", exam);
    const handleCerrarDetalles = () => handleCloseModal("detalles");

    const handleInscripcion = (id) => {
        handleAction("enroll", {
            routeParams: [id],
            options: {
                preserveScroll: true,
            },
        });
    };

    // HANDLERS DEL FORMULARIO DE CREACIÓN
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        exam_type: "",
        capacity: "",
        application_date: "",
        application_time: "",
        classroom: "",
        period_id: "",
        teacher_id: "",
    });

    const { hasRole } = usePermission();
    const esAdminOCoord = hasRole("admin") || hasRole("coordinator");
    const { flashModal, closeFlashModal } = useFlashAlert();

    const submit = (e) => {
        e.preventDefault();
        post(route("exams.store"), {
            onSuccess: () => handleCerrarModal(),
        });
    };

    const exp_mostrarFiltros = examenes.length > 0 || esAdminOCoord;

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
                                onClick={handleCrearExamen}
                            >
                                Crear Examen
                            </ThemeButton>
                        </div>
                    )}

                    {exp_mostrarFiltros && (
                        <ResourceFilterBar
                            busqueda={busqueda}
                            setBusqueda={setBusqueda}
                            searchPlaceholder="Buscar por nombre, docente, aula o fecha..."
                            totalFiltrados={itemsFiltrados.length}
                            resultSingularLabel="Examen encontrado"
                            resultPluralLabel="Exámenes encontrados"
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
                                icon={ClipboardList}
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                ariaLabel="Filtrar por tipo de examen"
                                minWidthClassName="min-w-[200px]"
                                placeholder="Todos los tipos"
                                options={typeOptions}
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

                    {seleccionados.length > 0 && esAdminOCoord && (
                        <ResourceBulkActionBar
                            seleccionados={seleccionados}
                            onClearSelection={handleClearSelection}
                            statuses={statuses}
                            onBulkStatus={(newStatus) =>
                                handleBulkStatus(newStatus)
                            }
                            onBulkDelete={() => handleBulkDelete()}
                            selectedSingularLabel="Examen seleccionado"
                            selectedPluralLabel="Exámenes seleccionados"
                            statusPlaceholder="Cambiar Estado"
                            confirmStatusChange={true}
                            statusModalTitle="Actualizar estado de exámenes"
                            statusModalMessage={(count, statusLabel) =>
                                `¿Deseas cambiar el estado de ${count} exámenes a \"${statusLabel}\"?`
                            }
                            statusConfirmText="Sí, actualizar"
                            deleteButtonText="Eliminar"
                            deleteModalTitle="Eliminar Exámenes"
                            deleteModalMessage={(count) =>
                                `¿Estas seguro de que deseas eliminar ${count} exámenes? Esta acción no se puede deshacer.`
                            }
                        />
                    )}

                    <ResourceGrid
                        items={itemsPaginados}
                        CardComponent={CardExam}
                        getCardProps={(exam) => ({
                            examen: exam,
                            seleccionado: seleccionados.includes(exam.id),
                            onToggleSelect: handleToggleSelect,
                            onVerDetalles: handleVerDetalles,
                            onInscribir: handleInscripcion,
                            onEditar: handleEditar,
                        })}
                        getItemKey={(exam) => exam.id}
                        hayFiltros={hayFiltros}
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        onPageChange={setPaginaActual}
                        EmptyIcon={CalendarX}
                        emptyTitle="Sin exámenes programados"
                        emptyMessage="Aún no hay exámenes registrados en el sistema."
                        emptyFilteredTitle="No hay resultados"
                        emptyFilteredMessage="Ajusta los filtros de búsqueda para encontrar sesiones de examen."
                    />
                </div>
            </div>

            <ExamDetailsModal
                examen={itemViendo}
                onClose={handleCerrarDetalles}
            />

            <Modal
                show={modales.formulario}
                onClose={handleCerrarModal}
                maxWidth="md"
            >
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        Agregar Nuevo Examen
                    </h2>

                    <div className="mb-4">
                        <InputLabel
                            htmlFor="nombre_examen"
                            value="Nombre del Examen"
                        />
                        <TextInput
                            id="nombre_examen"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.nombre_examen}
                            onChange={(e) =>
                                setData("nombre_examen", e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.nombre_examen}
                            className="mt-2"
                        />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="horario" value="Horario" />
                        <TextInput
                            id="horario"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.horario}
                            onChange={(e) => setData("horario", e.target.value)}
                            required
                        />
                        <InputError message={errors.horario} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel
                            htmlFor="fecha_aplicacion"
                            value="Fecha de Aplicación"
                        />
                        <TextInput
                            id="fecha_aplicacion"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_aplicacion}
                            onChange={(e) =>
                                setData("fecha_aplicacion", e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.fecha_aplicacion}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <SecondaryButton
                            onClick={handleCerrarModal}
                            disabled={processing}
                        >
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            Guardar
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

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
