import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { useState } from 'react';
import UserModal from "@/Pages/TestYochi/FormModals/UserModal";
import { Head } from '@inertiajs/react';

export default function Users({ degrees, students, teachers, levels }) {
    const VIEW_OPTIONS = [
        { value: "alumnos", label: "Alumnos" },
        { value: "maestros", label: "Maestros" },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Función para crear un nuevo registro
    const handleCreateNuevo = () => {
        setIsModalOpen(true);
    };
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Users
                </h2>
            }
        >
            <Head title="Usuarios" />
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <ResourceDashboard
                    title="Gestión Académica"
                    dataMap={{
                        alumnos: students,
                        maestros: teachers,
                    }}
                    viewOptions={VIEW_OPTIONS}
                    deleteRoute="/carreras/eliminar-masivo"
                    onNew={handleCreateNuevo}
                    // ── MODO DOCENTE: configuración de columnas ───────────────
                    // editableColumns: se vuelven <input type="number"/> cuando el
                    // docente activa el toggle. Usa los nombres exactos de tu Eloquent.
                    editableColumns={["firstName", "lastName"]}
                    // restrictedColumns: se eliminan COMPLETAMENTE en Modo Docente.
                    // No aparecen ni como columna ni en el menú "Toggle Columns".
                    restrictedColumns={["birthDate", "semester", "gender"]}
                />
            </div>
            <UserModal show={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Usuario"/>
        </AuthenticatedLayout>
    )
}
