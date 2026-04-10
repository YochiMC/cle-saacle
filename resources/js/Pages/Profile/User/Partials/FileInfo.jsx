import FormModal from '@/Components/Forms/FormModal';

/**
 * FileInfo
 *
 * Modal de solo lectura para mostrar la información de un documento del
 * expediente del alumno. Centraliza el detalle del archivo para evitar
 * duplicar la información en la tarjeta.
 *
 * @param {Object} props
 * @param {boolean} [props.show=false] Controla la visibilidad del modal.
 * @param {Function} [props.onClose=() => {}] Callback para cerrar el modal.
 * @param {Object|null} [props.document=null] Documento seleccionado.
 * @param {string} [props.title='Detalle del documento'] Título visible del modal.
 */
export default function FileInfo({ show = false, onClose = () => {}, document = null, title = 'Detalle del documento' }) {
    const statusLabels = {
        approved: 'Aprobado',
        rejected: 'Rechazado',
        pending: 'Pendiente',
    };

    const statusStyles = {
        approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        rejected: 'border-rose-200 bg-rose-50 text-rose-700',
        pending: 'border-amber-200 bg-amber-50 text-amber-700',
    };

    const formattedDate = document?.uploaded_at
        ? new Date(document.uploaded_at).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
        : 'Sin fecha';

    return (
        <FormModal title={title} show={show} onClose={onClose}>
            <div className="space-y-4">
                <p className="text-sm text-slate-600">
                    Revisa aquí la información del documento seleccionado.
                </p>

                {document && (
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documento</p>
                            <p className="mt-1 font-medium text-slate-800">{document?.original_name || 'Sin nombre'}</p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo</p>
                            <p className="mt-1 text-slate-800">{document?.type || 'Sin tipo'}</p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estatus</p>
                            <span className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[document?.status] ?? statusStyles.pending}`}>
                                {statusLabels[document?.status] ?? statusLabels.pending}
                            </span>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha de registro</p>
                            <p className="mt-1 text-slate-800">{formattedDate}</p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Comentarios</p>
                            <p className="mt-1 whitespace-pre-line text-slate-800">
                                {document?.comments || 'Sin comentarios'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D]/30"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </FormModal>
    );
}