import React, { useState, useMemo, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import ThemeButton from '@/Components/ThemeButton';
import { Plus } from 'lucide-react';
import { usePermission } from "@/Utils/auth";

import ExamFilters from "./ExamFilters";
import ExamGrid from "./ExamGrid";
import BulkActionBarExam from "./BulkActionBarExam";
import ExamDetailsModal from "./ExamDetailsModal";

const ITEMS_POR_PAGINA = 12;

export default function Examen({ auth, examenes = [], students = [], levels = [], teachers = [], periods = [] }) {
    // ESTADO PARA FILTROS Y GRID
    const [busqueda, setBusqueda] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterLevel, setFilterLevel] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [examenSeleccionado, setExamenSeleccionado] = useState(null);
    const [ordenCupo, setOrdenCupo] = useState(null);
    const [examenesSeleccionados, setExamenesSeleccionados] = useState([]);

    // ESTADO PARA FORMULARIO DE CREAR EXAMEN
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        student_id: '',
        nombre_examen: '',
        calificacion: '',
        fecha_aplicacion: '',
    });

    const { hasRole } = usePermission();
    const esAdminOCoord = hasRole("admin") || hasRole("coordinator");

    // LÓGICA DE FILTRADO
    const examenesFiltrados = useMemo(() => {
        setPaginaActual(1);
        const q = busqueda.toLowerCase();

        const filtrados = examenes.filter((e) => {
            if (q) {
                const nombre = (e.nombre_examen || "").toLowerCase();
                const alumno = (e.student ? e.student.name : "").toLowerCase();
                const pasaTexto = nombre.includes(q) || alumno.includes(q);
                if (!pasaTexto) return false;
            }
            // filterStatus y filterLevel no se aplican realmente hasta que la BD los soporte, pero simulamos
            if (filterStatus) {
                const statusExamen = (e.status || "active").toLowerCase();
                if (statusExamen !== filterStatus) return false;
            }
            return true;
        });

        return filtrados;
    }, [examenes, busqueda, filterStatus, filterLevel, ordenCupo]);

    const totalPaginas = Math.max(1, Math.ceil(examenesFiltrados.length / ITEMS_POR_PAGINA));
    const examenesPaginados = examenesFiltrados.slice(
        (paginaActual - 1) * ITEMS_POR_PAGINA,
        paginaActual * ITEMS_POR_PAGINA
    );

    // HANDLERS DEL GRID Y TARJETAS
    const handleInscripcion = (id) => alert("Simulando inscripción al examen " + id);
    const handleEditar = (examen) => alert("Abriendo edición para: " + examen.nombre_examen);
    
    const handleToggleSelect = useCallback((id) => {
        setExamenesSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((eId) => eId !== id) : [...prev, id]
        );
    }, []);

    const handleClearSelection = useCallback(() => setExamenesSeleccionados([]), []);
    const handleBulkChangeStatus = () => alert(`Cambiar estado de ${examenesSeleccionados.length} exámenes`);
    const handleBulkDelete = () => alert(`Eliminar ${examenesSeleccionados.length} exámenes`);

    // HANDLERS DEL FORMULARIO DE CREACIÓN
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('exams.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const hayFiltros = busqueda !== "" || filterStatus !== "" || filterLevel !== "" || ordenCupo !== null;
    const mostrarFiltros = examenes.length > 0 || esAdminOCoord;

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestión de Exámenes</h2>}
        >
            <Head title="Gestión de Exámenes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {esAdminOCoord && (
                        <div className="mb-6 flex flex-wrap items-center gap-4">
                            <ThemeButton theme="institutional" icon={Plus} onClick={openModal}>
                                Crear Examen
                            </ThemeButton>
                        </div>
                    )}

                    {mostrarFiltros && (
                        <ExamFilters
                            busqueda={busqueda}
                            setBusqueda={setBusqueda}
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            filterLevel={filterLevel}
                            setFilterLevel={setFilterLevel}
                            levels={levels}
                            totalFiltrados={examenesFiltrados.length}
                            ordenCupo={ordenCupo}
                            setOrdenCupo={setOrdenCupo}
                        />
                    )}

                    {examenesSeleccionados.length > 0 && esAdminOCoord && (
                        <BulkActionBarExam
                            seleccionados={examenesSeleccionados}
                            onClearSelection={handleClearSelection}
                            onBulkStatus={handleBulkChangeStatus}
                            onBulkDelete={handleBulkDelete}
                        />
                    )}

                    <ExamGrid
                        examenesPaginados={examenesPaginados}
                        hayFiltros={hayFiltros}
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        onPageChange={setPaginaActual}
                        onVerDetalles={setExamenSeleccionado}
                        onInscribir={handleInscripcion}
                        onEditar={handleEditar}
                        examenesSeleccionados={examenesSeleccionados}
                        onToggleSelect={handleToggleSelect}
                    />
                </div>
            </div>

            <ExamDetailsModal
                examen={examenSeleccionado}
                onClose={() => setExamenSeleccionado(null)}
            />

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Agregar Nuevo Examen</h2>

                    

                    <div className="mb-4">
                        <InputLabel htmlFor="nombre_examen" value="Nombre del Examen" />
                        <TextInput
                            id="nombre_examen"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.nombre_examen}
                            onChange={(e) => setData('nombre_examen', e.target.value)}
                            required
                        />
                        <InputError message={errors.nombre_examen} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="horario" value="Horario" />
                        <TextInput
                            id="horario"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.horario}
                            onChange={(e) => setData('horario', e.target.value)}
                            required
                        />
                        <InputError message={errors.horario} className="mt-2" />
                    </div>
                    
                        <div className="mb-4">
                        <InputLabel htmlFor="Aula" value="Aula" />
                        <TextInput
                            id="Aula"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.Aula}
                            onChange={(e) => setData('Aula', e.target.value)}
                            required
                        />
                        <InputError message={errors.Aula} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="fecha_aplicacion" value="Fecha de Aplicación" />
                        <TextInput
                            id="fecha_aplicacion"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_aplicacion}
                            onChange={(e) => setData('fecha_aplicacion', e.target.value)}
                            required
                        />
                        <InputError message={errors.fecha_aplicacion} className="mt-2" />
                    </div>
                    
                    <div className="flex items-center justify-end gap-4">
                        <SecondaryButton onClick={closeModal} disabled={processing}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
