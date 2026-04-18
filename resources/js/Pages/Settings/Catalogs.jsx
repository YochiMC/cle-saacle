import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ResourceDashboard from '@/Components/Resource/ResourceDashboard';
import DataFormModal from '@/Components/DataTable/DataFormModal';
import InputForm from '@/Components/Forms/InputForm';
import InputError from '@/Components/InputError';
import ModalAlert from '@/Components/ui/ModalAlert';
import ConfirmModal from '@/Components/ui/ConfirmModal';
import useFlashAlert from '@/Hooks/useFlashAlert';

/**
 * Vista centralizada de Catálogos (Periodos, Niveles, Tipos de Alumno, Carreras).
 * 
 * Implementa una UI con pestañas (Tabs) basadas en el Patrón Estrategia inyectado
 * desde el backend. Utiliza ResourceDashboard de forma unificada.
 */
export default function Catalogs({ catalogs = [] }) {
    // 1. Estado de pestañas (Tabs) sincronizado con ResourceDashboard
    const [activeTabId, setActiveTabId] = useState(catalogs[0]?.id || '');

    // 2. Estado del modal y del registro en edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // 3. Estado para confirmación de borrado
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Flash alerts
    const { flashModal, closeFlashModal } = useFlashAlert();

    // Catálogo activo
    const activeCatalog = catalogs.find((c) => c.id === activeTabId);

    // 3. Helper para inicializar el formulario dinámicamente según los campos configurados
    const getInitialValues = () => {
        if (!activeCatalog) return {};
        return activeCatalog.formFields.reduce((acc, field) => {
            acc[field.name] = editingRecord ? (editingRecord[field.name] ?? '') : '';
            return acc;
        }, {});
    };

    // 4. Hook de Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(getInitialValues());

    // 5. Ciclo de Vida: Reiniciar estado al cambiar de pestaña o de registro
    useEffect(() => {
        clearErrors();
        reset();
        setData(getInitialValues());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTabId, editingRecord, isModalOpen]);

    if (!activeCatalog) return null;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleOpenModal = (record = null) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
    };

    const handleOpenDeleteModal = (record) => {
        setItemToDelete(record);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;

        router.delete(`${activeCatalog.endpoint}/${itemToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setIsConfirmModalOpen(false),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => handleCloseModal(),
        };

        if (editingRecord) {
            put(`${activeCatalog.endpoint}/${editingRecord.id}`, options);
        } else {
            post(activeCatalog.endpoint, options);
        }
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

            {/* ── Modal Dinámico de Formulario ─────────────────────────────── */}
            <DataFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingRecord ? `Editar ${activeCatalog.title}` : `Nuevo ${activeCatalog.title}`}
                onSubmit={handleSubmit}
                processing={processing}
                submitText={editingRecord ? "Actualizar" : "Guardar"}
                maxWidth="lg"
            >
                <div className="space-y-5">
                    {activeCatalog.formFields.map((field) => (
                        <div key={field.name}>
                            <InputForm
                                label={field.label}
                                inputId={field.name}
                                type={field.type}
                                value={data[field.name]}
                                onChange={(e) => setData(field.name, e.target.value)}
                                required={field.required}
                                disabled={processing}
                            />
                            {/* Manejo de errores visuales de Inertia */}
                            <InputError message={errors[field.name]} className="mt-1.5" />
                        </div>
                    ))}
                </div>
            </DataFormModal>

            {/* ── Confirmación de Borrado ─────────────────────────────────── */}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={`Eliminar ${activeCatalog.title.slice(0, -1)}`}
                message={`¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.`}
                confirmText="Sí, eliminar"
                variant="danger"
            />

            {/* ── Alertas ──────────────────────────────────────────────────── */}
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
