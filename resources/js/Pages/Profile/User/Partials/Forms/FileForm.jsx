import FileInputForm from '@/Components/Forms/FileInputForm';
import FormModal from '@/Components/Forms/FormModal';
import ButtonForm from '@/Components/Forms/ButtonForm';
import SelectForm from '@/Components/Forms/SelectForm';
import InputForm from '@/Components/Forms/InputForm';
import { FieldError } from '@/Components/ui/field';
import { useForm } from '@inertiajs/react';

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_FILE_TYPES = '.pdf';

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
 * @param {Array<{value: string, label: string}>} [props.typeOptions=[]] Opciones de tipos de documento.
 */
export default function FileForm({
    show = false,
    onClose,
    title = 'Subir documento',
    typeOptions = [],
}) {
    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
        file: null,
        type: '',
        custom_name: '',
    });
    const hasFormErrors = Boolean(errors.file || errors.type || errors.custom_name);
    const isEvidenceType = data.type === 'evidencia';

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0] ?? null;

        setData('file', selectedFile);

        if (selectedFile) {
            clearErrors('file');
        }
    };

    /**
     * Recibe errores de validación del input reutilizable y los refleja en la UI del formulario.
     */
    const handleFileValidationError = (message) => {
        if (!message) {
            clearErrors('file');

            return;
        }

        setData('file', null);
        setError('file', message);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (hasFormErrors) {
            return;
        }

        post(route('documents.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset('file', 'type', 'custom_name');
                onClose?.();
            },
        });
    };

    const handleClose = () => {
        if (processing) {
            return;
        }

        reset('file', 'type', 'custom_name');
        clearErrors();
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
                    onValidationError={handleFileValidationError}
                    accept={ACCEPTED_FILE_TYPES}
                    maxFileSizeMb={MAX_FILE_SIZE_MB}
                    helperText="Da clic aquí para buscar"
                    buttonText="Seleccionar archivo"
                    description="Sube tu documento en formato PDF. Tamaño máximo: 5 MB."
                    required
                    disabled={processing}
                />
                <FieldError>{errors.file}</FieldError>

                <div>
                    <SelectForm
                        label="Tipo de documento"
                        selectId="type"
                        placeholder="Selecciona un tipo"
                        options={typeOptions}
                        value={data.type}
                        onValueChange={(value) => {
                            setData('type', value);
                            clearErrors('type');
                        }}
                        description="Especifica el tipo de documento para facilitar la validación administrativa."
                        disabled={processing}
                    />
                    <FieldError>{errors.type}</FieldError>
                </div>

                {isEvidenceType && (
                    <div>
                        <InputForm
                            id="custom_name"
                            label="Nombre del documento (Evidencia)"
                            name="custom_name"
                            type="text"
                            placeholder="Ej: Certificado de participación, Diploma, etc."
                            value={data.custom_name}
                            onChange={(e) => {
                                setData('custom_name', e.target.value);
                                clearErrors('custom_name');
                            }}
                            description="Proporciona un nombre descriptivo para esta evidencia que facilite la identificación."
                            disabled={processing}
                            required
                        />
                        <FieldError>{errors.custom_name}</FieldError>
                    </div>
                )}

                <ButtonForm
                    submitLabel="Guardar documento"
                    cancelLabel="Cancelar"
                    onCancel={handleClose}
                    isLoading={processing}
                    submitDisabled={hasFormErrors}
                    tone="institutional"
                />
            </form>
        </FormModal>

    );
}
