import { FileText } from 'lucide-react';

/**
 * Files
 *
 * Sección de expediente para la vista administrativa del perfil.
 * Presenta los documentos en modo lectura para que el administrador pueda
 * identificar el tipo de archivo, su nombre y la fecha de registro sin
 * exponer acciones de edición o eliminación.
 *
 * @param {Object} props
 * @param {Array} [props.documents=[]] Colección de documentos del usuario.
 */
export default function Files({ documents = [] }) {
    const formatDocumentDate = (document) => {
        const rawDate = document?.uploaded_at ?? document?.created_at;

        if (!rawDate) {
            return 'Sin fecha';
        }

        const parsedDate = new Date(rawDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return 'Sin fecha';
        }

        return parsedDate.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <section className="rounded-lg border border-blueTec/20 bg-white p-6 shadow sm:p-8">
            <div className="mb-5 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-semibold text-slate-800">Expediente</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Consulta los documentos asociados a este usuario desde una vista de solo lectura.
                </p>
            </div>

            {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-blueTec/30 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
                    Este usuario aún no tiene documentos cargados.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {documents.map((document, index) => (
                        <article
                            key={document?.id ?? `${document?.original_name ?? 'documento'}-${index}`}
                            className="overflow-hidden rounded-2xl border border-blueTec/20 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                        >
                            <div className="relative flex h-36 items-center justify-center bg-slate-100">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-300/65 text-slate-700">
                                    <FileText className="h-7 w-7" aria-hidden="true" />
                                </div>
                            </div>

                            <div className="bg-slate-50/60 px-4 py-3">
                                <p className="truncate text-lg font-semibold text-slate-800" title={document?.original_name}>
                                    {document?.original_name || 'Documento sin nombre'}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    {document?.type || 'Sin tipo'} • {formatDocumentDate(document)}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
