import React from 'react';
import { router } from '@inertiajs/react';
import ConfirmModal from '@/Components/ui/ConfirmModal';

/**
 * CatalogDeleteModal
 * 
 * Componente que encapsula la lógica de confirmación de borrado
 * para los catálogos dinámicos.
 */
export default function CatalogDeleteModal({ isOpen, onClose, activeCatalog, itemToDelete }) {
    if (!activeCatalog || !itemToDelete) return null;

    const handleConfirmDelete = () => {
        router.delete(`${activeCatalog.endpoint}/${itemToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirmDelete}
            title={`Eliminar ${activeCatalog.title.slice(0, -1)}`}
            message={`¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.`}
            confirmText="Sí, eliminar"
            variant="danger"
        />
    );
}
