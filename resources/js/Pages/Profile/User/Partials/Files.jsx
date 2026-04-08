import FileCard from '@/Components/FileCard';

/**
 * Files
 *
 * Listado de documentos del usuario autenticado dentro del perfil.
 * Renderiza un estado vacío cuando no hay registros y delega la tarjeta
 * visual de cada elemento al componente FileCard.
 *
 * @param {Object} props
 * @param {Array} props.documents Colección de documentos del perfil.
 * @param {Function} [props.onDeleteDocument] Callback para eliminar un documento.
 */
export default function Files({ documents = [], onDeleteDocument }) {
    return (
        <section className="rounded-lg border border-blueTec/20 bg-white p-6 shadow sm:p-8">
            <div className="mb-5 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-semibold text-slate-800">Expediente</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Consulta y administra tus documentos de identidad.
                </p>
            </div>

            {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-blueTec/30 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
                    Aún no has subido documentos.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {documents.map((doc) => (
                        <FileCard
                            key={doc.id}
                            document={doc}
                            onDelete={onDeleteDocument}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
