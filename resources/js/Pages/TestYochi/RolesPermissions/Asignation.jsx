import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import useFlashAlert from "@/Hooks/useFlashAlert";
import ConfirmModal from '@/Components/ConfirmModal';
import ModalAlert from "@/Components/ui/ModalAlert";
import RoleModal from "@/Pages/TestYochi/RolesPermissions/FormModals/RoleModal";
import PermissionModal from "@/Pages/TestYochi/RolesPermissions/FormModals/PermissionModal";

// Definidas fuera del componente para mantener referencia estable entre renders.
const VIEW_OPTIONS = [
    { value: "roles", label: "Roles" },
    { value: "permissions", label: "Permisos" },
];

export default function Asignation({ users, roles, permissions }) {

    // Centraliza el estado del modal de alertas de feedback (flash messages).
    const { flashModal, closeFlashModal } = useFlashAlert();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState("roles");

    const [itemToDelete, setItemToDelete] = useState(null);

    const handleEditRow = (item) => {
        console.log('Editar registro:', item, 'vista:', currentView);
        setIsModalOpen(true);
    };

    const handleOpenCreateModal = () => {
        setIsModalOpen(true);
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
    };

    const handleDeleteRow = () => {
        if (!itemToDelete) return;

        const itemId = itemToDelete?.id;
        if (!itemId) {
            console.error('No se pudo eliminar: id no disponible en el registro.', itemToDelete);
            return;
        }

        // Controlador de página temporal: deja el flujo de UI listo mientras defines rutas finales.
        switch (currentView) {
            case 'roles':
                console.log('Eliminar rol pendiente de integrar con backend. id:', itemId);
                setItemToDelete(null);
                break;
            case 'permissions':
                console.log('Eliminar permiso pendiente de integrar con backend. id:', itemId);
                setItemToDelete(null);
                break;
            default:
                setItemToDelete(null);
                break;
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Roles y Permisos</h2>}
        >
            <Head title="Roles y Permisos" />
            <ResourceDashboard
                title="Gestión de roles y permisos"
                dataMap={{ roles: roles, permissions: permissions }}
                viewOptions={VIEW_OPTIONS}
                deleteRoute="/carreras/eliminar-masivo"
                onNew={handleOpenCreateModal}
                onEditRow={handleEditRow}
                onDeleteRow={openDeleteModal}
                onViewChange={(view) => setCurrentView(view)}
                editableColumns={[]}
                hiddenColumns={{ permissions: false }}
            />
            {/* Modales — se monta únicamente el correspondiente a la vista activa */}
            {currentView === "roles" && (
                <RoleModal
                    title="Añadir rol"
                    show={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {currentView === "permissions" && (
                <ConfirmModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={() => setIsModalOpen(false)}
                    title="Formulario pendiente"
                    message="El modal de permisos aún no está implementado. Cuando lo definas, se conectará aquí."
                    confirmText="Entendido"
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
    )
}
