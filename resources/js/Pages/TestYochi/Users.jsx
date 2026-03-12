import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { useState } from 'react';
import UserModal from "@/Pages/TestYochi/FormModals/UserModal";
import ModalAlert from "@/Components/ui/ModalAlert";
import { Head } from '@inertiajs/react';
import { usePermission } from '@/Utils/auth';
import useFlashAlert from "@/Hooks/useFlashAlert"; // <-- Importamos nuestro nuevo hook

export default function Users({ degrees, students, teachers, levels, typeStudents }) {
    const { can, hasRole } = usePermission();

    // 1. Toda la lógica compleja de la alerta se resume en esta sola línea 😎
    const { flashModal, closeFlashModal } = useFlashAlert();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const VIEW_OPTIONS = [
        { value: "alumnos", label: "Alumnos" },
        { value: "maestros", label: "Maestros" },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Usuarios</h2>}>
            <Head title="Usuarios" />
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <ResourceDashboard
                    title="Gestión Académica"
                    dataMap={{ alumnos: students, maestros: teachers }}
                    viewOptions={VIEW_OPTIONS}
                    deleteRoute="/carreras/eliminar-masivo"
                    onNew={() => setIsModalOpen(true)}
                    editableColumns={["firstName", "lastName"]}
                    restrictedColumns={["birthDate", "semester", "gender"]}
                />
            </div>

            {/* Modales */}
            <UserModal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                degrees={degrees} levels={levels} typeStudents={typeStudents}
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
