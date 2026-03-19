/**
 * Users
 *
 * Vista de administración de usuarios. Permite alternar entre alumnos
 * y maestros, mostrar sus listados y abrir el modal de alta según
 * la vista seleccionada.
 *
 * @param {Object} props
 * @param {Array<Object>} props.degrees Carreras disponibles para el formulario de alumno.
 * @param {Array<Object>} props.students Listado de alumnos registrados.
 * @param {Array<Object>} props.teachers Listado de maestros registrados.
 * @param {Array<Object>} props.levels Niveles académicos disponibles.
 * @param {Array<Object>} props.typeStudents Tipos de estudiante (por ejemplo, Regular o Egresado).
 * @returns {JSX.Element}
 */

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { useState } from 'react';
import StudentModal from "@/Pages/TestYochi/FormModals/StudentModal";
import TeacherModal from "@/Pages/TestYochi/FormModals/TeacherModal";
import ModalAlert from "@/Components/ui/ModalAlert";
import { Head, router } from '@inertiajs/react';
import { usePermission } from '@/Utils/auth';
import useFlashAlert from "@/Hooks/useFlashAlert";
import ConfirmModal from '@/Components/ConfirmModal';


// Definidas fuera del componente para mantener referencia estable entre renders.
const VIEW_OPTIONS = [
    { value: "alumnos", label: "Alumnos" },
    { value: "maestros", label: "Maestros" },
];

export default function Users({ degrees, students, teachers, levels, typeStudents }) {
    const { can, hasRole } = usePermission();

    // Centraliza el estado del modal de alertas de feedback (flash messages).
    const { flashModal, closeFlashModal } = useFlashAlert();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState("alumnos");

    const [itemToDelete, setItemToDelete] = useState(null);

    /**
     * Navega al perfil del registro seleccionado.
     *
     * @param {Object} item
     * @param {number|string} item.user_id Identificador del usuario asociado al registro.
     * @returns {void}
     */


    const handleEditRow = (item) => {
        const userId = item?.user_id;

        if (!userId) {
            console.error('No se pudo abrir el perfil: user_id no disponible en el registro.', item);
            return;
        }

        router.get(route('profiles', userId));
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item); // Guardamos el usuario en el estado para que el modal sepa cuál es
    };

    const handleDeleteRow = () => {
        if (!itemToDelete) return; // Por seguridad

        const itemId = itemToDelete?.id;
        if (!itemId) {
            console.error('No se pudo eliminar: id no disponible en el registro.', itemToDelete);
            return;
        }

        switch (currentView) {
            case 'alumnos':
                router.delete(route('students.delete', itemId), {
                    onSuccess: () => setItemToDelete(null), // Cerramos el modal si tiene éxito
                });
                break;
            case 'maestros':
                router.delete(route('teachers.delete', itemId), {
                    onSuccess: () => setItemToDelete(null), // Cerramos el modal si tiene éxito
                });
                break;
        }
    }

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
                    onEditRow={handleEditRow}
                    onDeleteRow={openDeleteModal}
                    onViewChange={(view) => setCurrentView(view)}
                    editableColumns={["firstName", "lastName"]}
                    hiddenColumns={{ user_id: false, birthdate: false, type: false }}
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

            <ConfirmModal
                isOpen={itemToDelete != null}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDeleteRow}
                title="Eliminar usuario"
                // Opcional: Puedes usar el nombre del usuario en el mensaje para darle más contexto
                message={`¿Estás seguro de que deseas eliminar a ${itemToDelete?.first_name || itemToDelete?.full_name || 'este usuario'}? Esta acción no se puede deshacer.`}
                confirmText="Sí, eliminar"
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

