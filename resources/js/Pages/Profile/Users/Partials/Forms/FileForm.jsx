import FormModal from '@/Components/Forms/FormModal';

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
 */
export default function FileForm({ show = false, onClose = () => {}, title = 'Documentos', document = null }) {
    return (
        <FormModal title={title} show={show} onClose={onClose}>
            <div className="space-y-4">
                <p className="text-sm text-slate-600">
                    Esta vista queda reservada para la carga y revisión de documentos en el perfil de administradores.
                </p>
                <p className="text-sm text-slate-500">
                    Por ahora solo se muestra el expediente en modo lectura.
                </p>

                {document && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-600">
                        <p><span className="font-semibold text-slate-700">Documento:</span> {document?.original_name || 'Sin nombre'}</p>
                        <p><span className="font-semibold text-slate-700">Tipo:</span> {document?.type || 'Sin tipo'}</p>
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
