import FileCard from '@/Components/FileCard';

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
 * @param {Function} [props.onOpenDocumentForm] Callback al abrir acciones del documento.
 */
export default function Files({ documents = [], onOpenDocumentForm }) {
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
                        <FileCard
                            key={document?.id ?? `${document?.original_name ?? 'documento'}-${index}`}
                            document={document}
                            showDelete={false}
                            showMoreAction
                            onMoreAction={onOpenDocumentForm}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
