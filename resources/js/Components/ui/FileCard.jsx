
import { Download, EllipsisVertical, FileText, Trash2 } from 'lucide-react';
import { formatDocumentDate, getDocumentStatusMeta } from '@/Utils/documentStatus';

/**
 * FileCard
 *
 * Tarjeta visual para mostrar un documento del perfil del usuario.
 * Presenta nombre, tipo y fecha de subida, además de acciones para descargar
 * y eliminar el archivo.
 *
 * @param {Object} props
 * @param {Object} props.document Documento a renderizar.
 * @param {number|string} props.document.id Identificador único del documento.
 * @param {string} props.document.original_name Nombre original del archivo.
 * @param {string} props.document.type Tipo de documento (INE, RFC, CURP, etc.).
 * @param {string|null} props.document.uploaded_at Fecha de subida.
 * @param {Function} [props.onDelete] Callback al solicitar eliminación: (document) => void.
 * @param {Function} [props.onMoreAction] Callback para acción contextual: (document) => void.
 * @param {boolean} [props.showDownload=true] Indica si se muestra acción de descarga.
 * @param {boolean} [props.showDelete=true] Indica si se muestra acción de eliminación.
 * @param {boolean} [props.showMoreAction=false] Indica si se muestra acción de menú contextual.
 */
export default function FileCard({
    document,
    onDelete,
    onMoreAction,
    showDownload = true,
    showDelete = true,
    showMoreAction = false,
}) {
    const rawDate = document?.uploaded_at ?? document?.created_at;
    const status = document?.status ?? 'pending';
    const statusMeta = getDocumentStatusMeta(status);
    const formattedDate = formatDocumentDate(rawDate);

    const handleDelete = () => {
        if (onDelete) {
            onDelete(document);
        }
    };

    const handleMoreAction = () => {
        if (onMoreAction) {
            onMoreAction(document);
        }
    };

    return (
        <article className="overflow-hidden rounded-2xl border border-blueTec/20 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="relative flex h-36 items-center justify-center bg-slate-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-300/65 text-slate-700">
                    <FileText className="h-7 w-7" aria-hidden="true" />
                </div>
            </div>

            <div className="flex items-start justify-between gap-3 bg-slate-50/60 px-4 py-3">
                <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-slate-800" title={document?.original_name}>
                        {document?.original_name || 'Documento sin nombre'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        {document?.type_label || document?.type || 'Sin tipo'} • {formattedDate}
                    </p>
                    <span className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}>
                        {statusMeta.label}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {showDownload && (
                        <a
                            href={route('documents.download', document?.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#17365D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D]/30"
                            aria-label={`Descargar documento ${document?.original_name || ''}`.trim()}
                            title="Descargar documento"
                        >
                            <Download className="h-4 w-4" aria-hidden="true" />
                        </a>
                    )}

                    {showDelete && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                            aria-label={`Eliminar documento ${document?.original_name || ''}`.trim()}
                            title="Eliminar documento"
                        >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                    )}

                    {showMoreAction && (
                        <button
                            type="button"
                            onClick={handleMoreAction}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                            aria-label={`Más acciones para ${document?.original_name || 'el documento'}`}
                            title="Más acciones"
                        >
                            <EllipsisVertical className="h-4 w-4" aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
