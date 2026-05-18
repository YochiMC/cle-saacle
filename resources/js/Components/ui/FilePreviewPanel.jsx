import { FileText } from 'lucide-react';

function getFileExtension(file) {
    const originalName = file?.original_name || file?.name || '';

    return String(file?.extension || originalName.split('.').pop() || '').toLowerCase();
}

function isPreviewableImage(extension) {
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
}

function isPreviewablePdf(extension) {
    return extension === 'pdf';
}

export default function FilePreviewPanel({
    file = null,
    previewUrl = '',
    emptyMessage = 'No hay vista previa disponible para este archivo.',
    unsupportedMessage = 'Este archivo no admite vista previa directa. Usa la descarga para abrirlo.',
    className = '',
}) {
    const extension = getFileExtension(file);
    const fileName = file?.original_name || file?.name || 'Archivo sin nombre';
    const isImage = isPreviewableImage(extension);
    const isPdf = isPreviewablePdf(extension);
    const canPreview = Boolean(file && previewUrl && (isImage || isPdf || file.previewable === true));

    return (
        <div className={`space-y-4 ${className}`.trim()}>
            <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Vista previa
                </p>
                <p className="text-sm font-medium text-slate-800 break-all">
                    {fileName}
                </p>
            </div>

            {canPreview ? (
                isImage ? (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                        <img
                            src={previewUrl}
                            alt={fileName}
                            className="max-h-[72vh] w-full object-contain"
                        />
                    </div>
                ) : (
                    <iframe
                        src={previewUrl}
                        title={fileName}
                        className="h-[72vh] w-full rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
                    />
                )
            ) : (
                <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
                    <FileText className="mb-3 h-10 w-10 text-slate-400" />
                    <p className="max-w-xl">{file ? unsupportedMessage : emptyMessage}</p>
                </div>
            )}
        </div>
    );
}