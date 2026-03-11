import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { useState, useEffect } from 'react';
import UserModal from "@/Pages/TestYochi/FormModals/UserModal";
import ModalAlert from "@/Components/ui/ModalAlert";
import { Head, usePage } from '@inertiajs/react';

export default function Users({ degrees, students, teachers, levels, typeStudents }) {

    const { flash = {} } = usePage().props;

    const VIEW_OPTIONS = [
        { value: "alumnos", label: "Alumnos" },
        { value: "maestros", label: "Maestros" },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. Estado para controlar tu nuevo Modal de Alerta
    const [flashModal, setFlashModal] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    // 2. useEffect para escuchar cuando llegan mensajes de Laravel
    useEffect(() => {
        if (flash?.success) {
            setFlashModal({
                isOpen: true,
                type: 'success',
                title: '¡Operación exitosa!',
                message: flash.success
            });
        } else if (flash?.error) {
            setFlashModal({
                isOpen: true,
                type: 'error',
                title: '¡Ups! Algo salió mal',
                message: flash.error
            });
        }
    }, [flash]); // Se ejecuta cada vez que el objeto 'flash' cambia

    // 3. Función para cerrar el modal de alerta
    const closeFlashModal = () => {
        setFlashModal(prev => ({ ...prev, isOpen: false }));
    };
    // Función para crear un nuevo registro
    const handleCreateNuevo = () => {
        setIsModalOpen(true);
    };
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Usuarios
                </h2>
            }
        >
            <Head title="Usuarios" />
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
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
            <UserModal show={isModalOpen} onClose={() => setIsModalOpen(false)} degrees={degrees} levels={levels} typeStudents={typeStudents} />
            {/* 4. Tu nuevo Modal de Alerta */}
            <ModalAlert
                isOpen={flashModal.isOpen}
                onClose={closeFlashModal}
                type={flashModal.type}
                title={flashModal.title}
                message={flashModal.message}
            />
        </AuthenticatedLayout>
    )
}
