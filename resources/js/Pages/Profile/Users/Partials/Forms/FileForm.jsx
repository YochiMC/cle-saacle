import FormModal from '@/Components/Forms/FormModal';
import SelectForm from '@/Components/Forms/SelectForm';
import TextAreaForm from '@/Components/Forms/TextAreaForm';
import ButtonForm from '@/Components/Forms/ButtonForm';
import { FieldError } from '@/Components/ui/field';
import { useForm } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';

/**
 * FileForm
 *
 * Modal de revisión administrativa para actualizar estatus y comentarios
 * de documentos dentro del expediente de usuarios.
 *
 * @param {Object} props
 * @param {boolean} [props.show=false] Controla la visibilidad del modal.
 * @param {Function} [props.onClose=() => {}] Callback para cerrar el modal.
 * @param {string} [props.title='Documentos'] Título visible del modal.
 * @param {Object|null} [props.document=null] Documento seleccionado desde el expediente.
 * @param {Array} [props.statusOptions=[]] Opciones permitidas para el estatus de revisión.
 */
export default function FileForm({
    show = false,
    onClose = () => {},
    title = 'Documentos',
    document = null,
    statusOptions = [],
}) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        status: '',
        comments: '',
    });
    const hasFormErrors = Boolean(errors.status || errors.comments);

    const allowedStatuses = useMemo(
        () => statusOptions.map((option) => option.value),
        [statusOptions]
    );

    useEffect(() => {
        if (!show || !document?.id) {
            return;
        }

        setData('status', allowedStatuses.includes(document?.status) ? document.status : '');
        setData('comments', document?.comments ?? '');
    }, [allowedStatuses, document, setData, show]);

    const handleClose = () => {
        if (processing) {
            return;
        }

        reset('status', 'comments');
        onClose();
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!document?.id || hasFormErrors) {
            return;
        }

        put(route('documents.update', document.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset('status', 'comments');
                onClose();
            },
        });
    };

    return (
        <FormModal title={title} show={show} onClose={handleClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-slate-600">
                    Esta vista permite actualizar el estatus de revisión del documento seleccionado.
                </p>
                <p className="text-sm text-slate-500">
                    Si rechazas el documento, debes registrar un comentario para justificar la decisión.
                </p>
                <SelectForm
                    label="Estatus del documento"
                    selectId="status"
                    placeholder="Selecciona un estatus"
                    options={statusOptions}
                    value={data.status}
                    onValueChange={(value) => {
                        setData('status', value);
                        clearErrors('status');

                        if (value !== 'rejected') {
                            clearErrors('comments');
                        }
                    }}
                    description="Solo se permiten estatus de aprobación o rechazo para esta revisión."
                    disabled={processing}
                />
                <FieldError>{errors.status}</FieldError>
                <TextAreaForm
                    label="Comentarios"
                    textAreaId="comments"
                    placeholder="Agrega un comentario opcional para el usuario..."
                    description="Usa este espacio para justificar el cambio de estatus."
                    value={data.comments}
                    onChange={(event) => {
                        setData('comments', event.target.value);
                        clearErrors('comments');
                    }}
                    rows={5}
                    disabled={processing}
                />
                <FieldError>{errors.comments}</FieldError>
                {document && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-600">
                        <p><span className="font-semibold text-slate-700">Documento:</span> {document?.original_name || 'Sin nombre'}</p>
                        <p><span className="font-semibold text-slate-700">Tipo:</span> {document?.type_label || document?.type || 'Sin tipo'}</p>
                    </div>
                )}

                <ButtonForm
                    submitLabel="Guardar revisión"
                    cancelLabel="Cerrar"
                    onCancel={handleClose}
                    isLoading={processing}
                    submitDisabled={!document?.id || hasFormErrors}
                    tone="institutional"
                />
            </form>
        </FormModal>
    );
}
