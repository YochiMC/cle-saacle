import Modal from '@/Components/ui/Modal';
import FilePreviewPanel from '@/Components/ui/FilePreviewPanel';

export default function DocumentPreviewModal({
    show = false,
    onClose = () => {},
    document = null,
    title = 'Vista previa del documento',
    maxWidth = '6xl',
}) {
    const previewUrl = document?.preview_url;

    return (
        <Modal show={show} onClose={onClose} maxWidth={maxWidth}>
            <div className="flex max-h-[90vh] flex-col overflow-hidden">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">{title}</p>
                        <p className="text-sm text-slate-600">Visualización previa del documento seleccionado.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                        aria-label="Cerrar vista previa"
                    >
                        <span className="text-2xl leading-none">&times;</span>
                    </button>
                </div>

                <div className="overflow-y-auto px-6 py-6">
                    <FilePreviewPanel
                        file={document}
                        previewUrl={previewUrl}
                    />
                </div>
            </div>
        </Modal>
    );
}
