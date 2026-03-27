import FormModal from "@/Components/Forms/FormModal"
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/Components/ui/field';
import InputForm from "@/Components/Forms/InputForm";
import ButtonForm from "@/Components/Forms/ButtonForm";
import { useForm } from '@inertiajs/react';

/**
 * Modal base para alta/edición de permisos.
 * Queda listo para integrar su endpoint desde la Page.
 */
export default function PermissionModal({ title, show, onClose, onSubmitPermission }) {
    const { data, setData, processing, reset } = useForm({
        name: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (typeof onSubmitPermission === 'function') {
            onSubmitPermission({ data, reset, onClose });
            return;
        }

        console.warn('Integración pendiente: define onSubmitPermission para enviar el formulario al backend.');
    };

    return (
        <FormModal
            title={title}
            show={show}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <FieldLegend>Información del permiso</FieldLegend>
                    <FieldDescription>Completa los campos para crear un nuevo permiso.</FieldDescription>
                    <FieldSet>
                        <InputForm
                            label="Nombre del permiso"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </FieldSet>
                    <FieldSet>
                        <ButtonForm
                            submitLabel="Guardar permiso"
                            cancelLabel="Cancelar"
                            onCancel={onClose}
                            isLoading={processing}
                        />
                    </FieldSet>
                </FieldGroup>
            </form>
        </FormModal>
    )
}