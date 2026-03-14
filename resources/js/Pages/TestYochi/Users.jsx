/**
 * Users
 *
 * Vista de administración de usuarios del sistema. Gestiona dos entidades
 * en una sola pantalla: Alumnos y Maestros. Renderiza un ResourceDashboard
 * con un selector de vista y abre el modal de registro correspondiente
 * según la entidad activa.
 *
 * @component
 *
 * @param {Array}  degrees       - Listado de carreras disponibles para el formulario de alumno.
 * @param {Array}  students      - Listado de alumnos registrados.
 * @param {Array}  teachers      - Listado de maestros registrados.
 * @param {Array}  levels        - Listado de niveles académicos disponibles.
 * @param {Array}  typeStudents  - Listado de tipos de estudiante (ej. Regular, Egresado).
 */

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { useState } from 'react';
import StudentModal from "@/Pages/TestYochi/FormModals/StudentModal";
import TeacherModal from "@/Pages/TestYochi/FormModals/TeacherModal";
import ModalAlert from "@/Components/ui/ModalAlert";
import { Head } from '@inertiajs/react';
import { usePermission } from '@/Utils/auth';
import useFlashAlert from "@/Hooks/useFlashAlert";

// Opciones de vista estáticas — definidas fuera del componente para evitar
// recreaciones en cada render.
const VIEW_OPTIONS = [
    { value: "alumnos", label: "Alumnos" },
    { value: "maestros", label: "Maestros" },
];

export default function Users({ degrees, students, teachers, levels, typeStudents }) {
    const { can, hasRole } = usePermission();

    // La lógica de estado del modal de alerta se centraliza en este hook.
    const { flashModal, closeFlashModal } = useFlashAlert();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState("alumnos");

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Usuarios</h2>}>
            <Head title="Usuarios" />
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <ResourceDashboard
                    title="Gestión de usuarios"
                    dataMap={{ alumnos: students, maestros: teachers }}
                    viewOptions={VIEW_OPTIONS}
                    deleteRoute="/carreras/eliminar-masivo"
                    onNew={() => setIsModalOpen(true)}
                    onViewChange={(view) => setCurrentView(view)}
                    editableColumns={["firstName", "lastName"]}
                    restrictedColumns={["birthDate", "semester", "gender"]}
                />
            </div>

            {/* Modales — se monta únicamente el correspondiente a la vista activa */}
            {currentView === "alumnos" && (
                <StudentModal
                    title="Añadir alumno"
                    show={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    degrees={degrees}
                    levels={levels}
                    typeStudents={typeStudents}
                />
            )}

            {currentView === "maestros" && (
                <TeacherModal
                    title="Añadir maestro"
                    show={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

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

