import FileInputForm from '@/Components/Forms/FileInputForm';
import FormModal from '@/Components/Forms/FormModal';
import ButtonForm from '@/Components/Forms/ButtonForm';
import SelectForm from '@/Components/Forms/SelectForm';
import { FieldError } from '@/Components/ui/field';
import { useForm } from '@inertiajs/react';

const DOCUMENT_TYPE_OPTIONS = [
    { value: 'INE', label: 'INE' },
    { value: 'RFC', label: 'RFC' },
    { value: 'CURP', label: 'CURP' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
    { value: 'LICENCIA', label: 'Licencia de conducir' },
    { value: 'OTRO', label: 'Otro' },
];

/**
 * FileForm
 *
 * Modal para captura de documentos de identidad dentro del perfil del usuario.
 * Encapsula la UI de carga y expone los controles mínimos de cancelar/guardar.
 *
 * @param {Object} props
 * @param {boolean} [props.show=false] Controla visibilidad del modal.
 * @param {Function} props.onClose Callback para cerrar el modal.
 * @param {string} [props.title='Subir documento'] Título del encabezado del modal.
 */
export default function FileForm({
    show = false,
    onClose,
    title = 'Subir documento',
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
        type: '',
    });

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0] ?? null;
        setData('file', selectedFile);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        post(route('documents.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset('file', 'type');
                onClose?.();
            },
        });
    };

    const handleClose = () => {
        if (processing) {
            return;
        }

        reset('file', 'type');
        onClose?.();
    };

    return (
        <FormModal
            title={title}
            show={show}
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <FileInputForm
                    name="file"
                    label="Documento de identidad"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    helperText="Da clic aquí para buscar"
                    buttonText="Seleccionar archivo"
                    description="Sube tus documentos. Formatos permitidos: PDF, JPG, JPEG y PNG."
                    required
                    disabled={processing}
                />
                <FieldError>{errors.file}</FieldError>

                <div>
                    <SelectForm
                        label="Tipo de documento"
                        selectId="type"
                        placeholder="Selecciona un tipo"
                        options={DOCUMENT_TYPE_OPTIONS}
                        value={data.type}
                        onValueChange={(value) => setData('type', value)}
                        description="Especifica el tipo de documento para facilitar la validación administrativa."
                        disabled={processing}
                    />
                    <FieldError>{errors.type}</FieldError>
                </div>

                <ButtonForm
                    submitLabel="Guardar documento"
                    cancelLabel="Cancelar"
                    onCancel={handleClose}
                    isLoading={processing}
                    tone="institutional"
                />
            </form>
        </FormModal>

    );
}
