import FormModal from '@/Components/Forms/FormModal';

function isPreviewableImage(document) {
    return ['jpg', 'jpeg', 'png'].includes(document?.extension);
}

function isPreviewablePdf(document) {
    return document?.extension === 'pdf';
}

export default function DocumentPreviewModal({
    show = false,
    onClose = () => {},
    document = null,
    title = 'Vista previa del documento',
}) {
    const previewUrl = document?.preview_url;
    const isImage = isPreviewableImage(document);
    const isPdf = isPreviewablePdf(document);

    return (
        <FormModal title={title} show={show} onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-slate-600">
                        Visualización previa del documento seleccionado.
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                        {document?.original_name || 'Documento sin nombre'}
                    </p>
                </div>

                {document && previewUrl ? (
                    isImage ? (
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            <img
                                src={previewUrl}
                                alt={document?.original_name || 'Vista previa del documento'}
                                className="h-auto max-h-[70vh] w-full object-contain"
                            />
                        </div>
                    ) : isPdf ? (
                        <iframe
                            src={previewUrl}
                            title={document?.original_name || 'Vista previa del PDF'}
                            className="h-[70vh] w-full rounded-lg border border-slate-200 bg-slate-50"
                        />
                    ) : (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                            Este archivo no admite vista previa directa. Usa la descarga para abrirlo.
                        </div>
                    )
                ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                        No hay vista previa disponible para este documento.
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
