import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import DataFormModal from '@/Components/DataTable/DataFormModal';
import InputForm from '@/Components/Forms/InputForm';
import InputError from '@/Components/InputError';

/**
 * CatalogFormModal
 * 
 * Componente especializado que encapsula la lógica de creación y edición
 * de registros para cualquier catálogo dinámico.
 * 
 * @param {boolean} isOpen - Controla la visibilidad del modal.
 * @param {function} onClose - Callback para cerrar el modal.
 * @param {object} activeCatalog - Configuración del catálogo actual.
 * @param {object|null} editingRecord - Registro en edición (null para nuevo).
 */
export default function CatalogFormModal({ isOpen, onClose, activeCatalog, editingRecord }) {
    
    // 1. Helper para inicializar el formulario dinámicamente según los campos configurados
    const getInitialValues = () => {
        if (!activeCatalog) return {};
        return activeCatalog.formFields.reduce((acc, field) => {
            acc[field.name] = editingRecord ? (editingRecord[field.name] ?? '') : '';
            return acc;
        }, {});
    };

    // 2. Hook de Inertia: Gestionado internamente para SRP
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(getInitialValues());

    // 3. Ciclo de Vida: Reiniciar estado al cambiar de contexto o abrir el modal
    useEffect(() => {
        if (isOpen) {
            clearErrors();
            reset();
            setData(getInitialValues());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, activeCatalog, editingRecord]);

    if (!activeCatalog) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => onClose(),
        };

        if (editingRecord) {
            put(`${activeCatalog.endpoint}/${editingRecord.id}`, options);
        } else {
            post(activeCatalog.endpoint, options);
        }
    };

    return (
        <DataFormModal
            isOpen={isOpen}
            onClose={onClose}
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
    );
}
