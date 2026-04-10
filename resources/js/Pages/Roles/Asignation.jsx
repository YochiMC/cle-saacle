import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ResourceDashboard from "@/Components/ResourceDashboard";
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import useFlashAlert from "@/Hooks/useFlashAlert";
import ConfirmModal from '@/Components/ConfirmModal';
import ModalAlert from "@/Components/ui/ModalAlert";
import RoleModal from "@/Components/Roles/RoleModal";
import UpdateRoleModal from "@/Components/Roles/UpdateRoleModal";

// Definidas fuera del componente para mantener referencia estable entre renders.
const VIEW_OPTIONS = [
    { value: "roles", label: "Roles" },
];

/**
 * Vista de gestión de roles y permisos.
 * Centraliza handlers de UI para crear, editar y eliminar por tipo de entidad.
 */
export default function Asignation({ users, roles, permissions }) {
    // Centraliza el estado del modal de alertas de feedback (flash messages).
    const { flashModal, closeFlashModal } = useFlashAlert();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState("roles");
    const [itemToEdit, setItemToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const handleEditRow = (item) => {
        if (currentView !== 'roles') return;

        setItemToEdit(item);
        setIsUpdateModalOpen(true);
    };

    const handleOpenCreateModal = () => {
        if (currentView !== 'roles') return;

        setIsCreateModalOpen(true);
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setItemToEdit(null);
    };

    const handleDeleteRow = () => {
        if (!itemToDelete) return;

        const itemId = itemToDelete?.id;
        if (!itemId) {
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
                hiddenColumns={{ permissions: false, is_system: false, id: false }}
            />
            {/* Modales — se monta únicamente el correspondiente a la vista activa */}
            {currentView === "roles" && (
                <RoleModal
                    permissions={permissions}
                    title="Añadir rol"
                    show={isCreateModalOpen}
                    onClose={closeCreateModal}
                />
            )}

            {currentView === "roles" && itemToEdit && (
                <UpdateRoleModal
                    permissions={permissions}
                    title="Editar rol"
                    show={isUpdateModalOpen}
                    onClose={closeUpdateModal}
                    role={itemToEdit}
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
