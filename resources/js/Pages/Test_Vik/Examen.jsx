import React, { useState, useMemo, useCallback } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import ThemeButton from "@/Components/ThemeButton";
import { Plus } from "lucide-react";
import { usePermission } from "@/Utils/auth";

import ExamFilters from "./ExamFilters";
import ExamGrid from "./ExamGrid";
import BulkActionBarExam from "./BulkActionBarExam";
import ExamDetailsModal from "./ExamDetailsModal";
import { useExamsManagement } from "@/Hooks/useExamsManagement";

const ITEMS_POR_PAGINA = 12;

export default function Examen({
    auth,
    examenes = [],
    students = [],
    levels = [],
    teachers = [],
    periods = [],
    statuses = [],
    typeOptions = [],
}) {
    const {
        busqueda,
        setBusqueda,
        filtroEstado,
        setFiltroEstado,
        filtroTipo,
        setFiltroTipo,
        ordenCupo,
        setOrdenCupo,
        paginaActual,
        setPaginaActual,
        examenesSeleccionados,
        modalAbierto,
        examenEditando,
        examenViendo,
        examenesFiltrados,
        totalPaginas,
        examenesPaginados,
        hayFiltros,
        handleToggleSelect,
        handleClearSelection,
        handleCrearExamen,
        handleEditar,
        handleCerrarModal,
        handleVerDetalles,
        handleCerrarDetalles,
        handleInscripcion,
        handleBulkStatus,
        handleBulkDelete,
    } = useExamsManagement({ exams: examenes });

    // HANDLERS DEL FORMULARIO DE CREACIÓN
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
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
                        <ExamFilters
                            busqueda={busqueda}
                            setBusqueda={setBusqueda}
                            filtroEstado={filtroEstado}
                            setFiltroEstado={setFiltroEstado}
                            filtroTipo={filtroTipo}
                            setFiltroTipo={setFiltroTipo}
                            statuses={statuses}
                            typeOptions={typeOptions}
                            totalFiltrados={examenesFiltrados.length}
                            ordenCupo={ordenCupo}
                            setOrdenCupo={setOrdenCupo}
                        />
                    )}

                    {examenesSeleccionados.length > 0 && esAdminOCoord && (
                        <BulkActionBarExam
                            seleccionados={examenesSeleccionados}
                            onClearSelection={handleClearSelection}
                            onBulkStatus={handleBulkStatus}
                            onBulkDelete={handleBulkDelete}
                        />
                    )}

                    <ExamGrid
                        examenesPaginados={examenesPaginados}
                        hayFiltros={hayFiltros}
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        onPageChange={setPaginaActual}
                        onVerDetalles={handleVerDetalles}
                        onInscribir={handleInscripcion}
                        onEditar={handleEditar}
                        examenesSeleccionados={examenesSeleccionados}
                        onToggleSelect={handleToggleSelect}
                    />
                </div>
            </div>

            <ExamDetailsModal
                examen={examenViendo}
                onClose={handleCerrarDetalles}
            />

            <Modal
                show={modalAbierto}
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
        </AuthenticatedLayout>
    );
}
