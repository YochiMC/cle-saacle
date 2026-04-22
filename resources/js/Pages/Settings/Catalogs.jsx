import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ResourceDashboard from '@/Components/Resource/ResourceDashboard';
import ModalAlert from '@/Components/ui/ModalAlert';
import useFlashAlert from '@/Hooks/useFlashAlert';

// Sub-componentes refactorizados
import CatalogFormModal from './Components/CatalogFormModal';
import CatalogDeleteModal from './Components/CatalogDeleteModal';

/**
 * Vista centralizada de Catálogos (Periodos, Niveles, Tipos de Alumno, Carreras).
 * 
 * Orquestador principal que delega la lógica de formularios y borrado
 * a sub-componentes especializados para mantener la legibilidad y SRP.
 */
export default function Catalogs({ catalogs = [] }) {
    // 1. Estado de pestañas (Tabs) sincronizado con ResourceDashboard
    const [activeTabId, setActiveTabId] = useState(catalogs[0]?.id || '');

    // 2. Estado del modal de formulario y del registro en edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // 3. Estado para confirmación de borrado
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Flash alerts
    const { flashModal, closeFlashModal } = useFlashAlert();

    // Catálogo activo basado en la pestaña
    const activeCatalog = catalogs.find((c) => c.id === activeTabId);

    if (!activeCatalog) return null;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleOpenModal = (record = null) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (record) => {
        setItemToDelete(record);
        setIsDeleteModalOpen(true);
    };

    // ── Preparación de datos para ResourceDashboard ──────────────────────────
    const dataMap = catalogs.reduce((acc, catalog) => {
        acc[catalog.id] = catalog.data;
        return acc;
    }, {});

    const viewOptions = catalogs.map(c => ({ value: c.id, label: c.title }));

    // Configuración de rutas de borrado masivo
    const deleteRoutes = {
        periods: route('periods.bulk-delete'),
        levels: route('levels.bulk-delete'),
        degrees: route('degrees.bulk-delete'),
        'type-students': route('type-students.bulk-delete'),
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Gestión de Catálogos</h2>}>
            <ResourceDashboard
                title="Gestión de Catálogos"
                dataMap={dataMap}
                viewOptions={viewOptions}
                onNew={() => handleOpenModal()}
                onEditRow={(row) => handleOpenModal(row)}
                onDeleteRow={handleOpenDeleteModal}
                onViewChange={(view) => setActiveTabId(view)}
                customColumns={activeCatalog.columns}
                deleteRoute={deleteRoutes}
                bulkDeleteMethod="delete"
            />

            {/* ── Modales Especializados ───────────────────────────────────── */}
            
            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                activeCatalog={activeCatalog}
                editingRecord={editingRecord}
            />

            <CatalogDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                activeCatalog={activeCatalog}
                itemToDelete={itemToDelete}
            />

            <ModalAlert
                isOpen={flashModal.isOpen}
                onClose={closeFlashModal}
                type={flashModal.type || 'info'}
                title={flashModal.title}
                message={flashModal.message}
            />
        </AuthenticatedLayout>
    );
}
