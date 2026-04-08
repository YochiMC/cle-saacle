
import { Download, FileText, Trash2 } from 'lucide-react';

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
 */
export default function FileCard({ document, onDelete }) {
    const formattedDate = document?.uploaded_at
        ? new Date(document.uploaded_at).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
        : 'Sin fecha';

    const handleDelete = () => {
        if (onDelete) {
            onDelete(document);
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
                        {document?.type || 'Sin tipo'} • {formattedDate}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <a
                        href={route('documents.download', document?.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#17365D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D]/30"
                        aria-label={`Descargar documento ${document?.original_name || ''}`.trim()}
                        title="Descargar documento"
                    >
                        <Download className="h-4 w-4" aria-hidden="true" />
                    </a>

                    <button
                        type="button"
                        onClick={handleDelete}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                        aria-label={`Eliminar documento ${document?.original_name || ''}`.trim()}
                        title="Eliminar documento"
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </article>
    );
}
