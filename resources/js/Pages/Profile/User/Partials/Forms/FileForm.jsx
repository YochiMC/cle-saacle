import FileInputForm from '@/Components/Forms/FileInputForm';
import FormModal from '@/Components/Forms/FormModal';
import ButtonForm from '@/Components/Forms/ButtonForm';
import SelectForm from '@/Components/Forms/SelectForm';
import { FieldError } from '@/Components/ui/field';
import { useForm } from '@inertiajs/react';

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
    });

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0] ?? null;

        if (selectedFile) {
            // 2. Definimos el tamaño máximo (10 MB en bytes)
            const maxSizeInBytes = 10 * 1024 * 1024; 

            if (selectedFile.size > maxSizeInBytes) {
                // 3. Si es muy pesado, lanzamos el error a la UI y evitamos guardarlo en el estado
                setError('file', 'El archivo es demasiado pesado. El límite máximo es de 10MB.');
                setData('file', null);
                clearErrors('file');
                // Limpiamos el input físico (opcional, dependiendo de cómo maneje el estado interno tu FileInputForm)
                event.target.value = ''; 
                return;
            }
        }

        // 4. Si el archivo es válido, limpiamos cualquier error previo y lo guardamos
        clearErrors('file');
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
                        options={typeOptions}
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
