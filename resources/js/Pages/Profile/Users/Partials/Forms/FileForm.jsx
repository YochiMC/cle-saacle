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
 * Modal informativo reservado para el flujo de documentos en la vista de
 * administradores. Por ahora no envía datos al backend y funciona como apoyo
 * visual para conservar la estructura del módulo mientras se habilita la carga.
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
    const { data, setData, put, processing, errors, reset } = useForm({
        status: '',
        comments: '',
    });

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

        if (!document?.id) {
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
                    Esta vista queda reservada para la carga y revisión de documentos en el perfil de administradores.
                </p>
                <p className="text-sm text-slate-500">
                    Deja un comentario en caso de rechazar el documento.
                </p>
                <SelectForm
                    label="Estatus del documento"
                    selectId="status"
                    placeholder="Selecciona un estatus"
                    options={statusOptions}
                    value={data.status}
                    onValueChange={(value) => setData('status', value)}
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
                    onChange={(event) => setData('comments', event.target.value)}
                    rows={5}
                    disabled={processing}
                />
                <FieldError>{errors.comments}</FieldError>
                {document && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-600">
                        <p><span className="font-semibold text-slate-700">Documento:</span> {document?.original_name || 'Sin nombre'}</p>
                        <p><span className="font-semibold text-slate-700">Tipo:</span> {document?.type || 'Sin tipo'}</p>
                    </div>
                )}

                <ButtonForm
                    submitLabel="Guardar revisión"
                    cancelLabel="Cerrar"
                    onCancel={handleClose}
                    isLoading={processing}
                    tone="institutional"
                />
            </form>
        </FormModal>
    );
}
