import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { Head, router } from '@inertiajs/react';
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

/**
 * Vista de gestión de roles y permisos.
 * Centraliza handlers de UI para crear, editar y eliminar por tipo de entidad.
 */
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

    const handleSubmitRole = ({ data, reset, onClose }) => {
        console.log('Crear/editar rol pendiente de integrar con backend:', data);
        reset();
        onClose?.();
        setIsModalOpen(false);
    };

    const handleSubmitPermission = () => {
        console.log('Crear/editar permiso pendiente de integrar con backend.');
        setIsModalOpen(false);
    };

    const handleDeleteRow = () => {
        if (!itemToDelete) return;

        const itemId = itemToDelete?.id;
        if (!itemId) {
            console.error('No se pudo eliminar: id no disponible en el registro.', itemToDelete);
            setItemToDelete(null);
            return;
        }

        // Elimina según la vista activa para mantener una sola confirmación de borrado.
        switch (currentView) {
            case 'roles':
                router.delete(route('roles.destroy', itemId), {
                    onSuccess: () => setItemToDelete(null),
                });
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
                    permissions={permissions}
                    title="Añadir rol"
                    show={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmitRole={handleSubmitRole}
                />
            )}

            {currentView === "permissions" && (
                <PermissionModal
                    title="Añadir permiso"
                    show={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmitPermission={handleSubmitPermission}
                />
            )}

            <ConfirmModal
                isOpen={itemToDelete != null}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDeleteRow}
                title={currentView === 'roles' ? 'Eliminar rol' : 'Eliminar permiso'}
                message={currentView === 'roles'
                    ? `¿Estás seguro de que deseas eliminar el rol ${itemToDelete?.name || 'seleccionado'}? Esta acción no se puede deshacer.`
                    : `¿Estás seguro de que deseas eliminar el permiso ${itemToDelete?.name || 'seleccionado'}? Esta acción no se puede deshacer.`}
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
