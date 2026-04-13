import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import ModalAlert from "@/Components/ui/ModalAlert";
import useFlashAlert from "@/Hooks/useFlashAlert";
import Files from './Partials/Files';
import FileForm from './Partials/Forms/FileForm';
import { useState } from 'react';

<<<<<<< HEAD
/**
 * Profile
 *
 * Vista principal del perfil de un usuario administrado desde el panel.
 * Conserva la estructura del perfil existente y agrega el expediente en un
 * bloque independiente de solo lectura para mantener la separación de
 * responsabilidades entre edición de datos y consulta de documentos.
 *
 * @param {Object} props
 * @param {Array} props.roles Lista de roles disponibles para el usuario.
 * @param {Object} props.user Usuario que se está administrando.
 * @param {Array} props.degrees Catálogo de grados académicos.
 * @param {Array} props.levels Catálogo de niveles académicos.
 * @param {Array} props.typeStudents Catálogo de tipos de estudiante.
 * @param {Array} [props.documentStatuses=[]] Opciones de estatus para revisión de documentos.
 * @param {Array} [props.documents=[]] Documentos asociados al usuario.
 */
export default function Profile({ roles, user, degrees, levels, typeStudents, documentStatuses = [], documents = [] }) {
    const { flashModal, closeFlashModal } = useFlashAlert();
    const userDocuments = documents.length > 0 ? documents : user?.documents ?? [];
    const [showFileForm, setShowFileForm] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const openDocumentForm = (document) => {
        setSelectedDocument(document ?? null);
        setShowFileForm(true);
    };

    const closeDocumentForm = () => {
        setShowFileForm(false);
        setSelectedDocument(null);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">
                Perfil de usuario
            </h2>}
=======
export default function Profile({
    roles,
    user,
    hasStudent,
    degrees,
    levels,
    typeStudents,
}) {
    const { flashModal, closeFlashModal } = useFlashAlert();
    const safeUser = user?.data ?? user;
    const isStudentProfile =
        Boolean(hasStudent) || safeUser?.profile?.type === "student";

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Perfil
                </h2>
            }
>>>>>>> 13b3c214f902014e815b9a52a90fca8d0d409d35
        >
            <Head title="Perfil de usuario" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="p-4 bg-white border shadow border-blueTec/20 lg:col-span-2 sm:rounded-lg sm:p-8">
                            <UpdateProfileInformationForm
                                user={safeUser}
                                degrees={degrees}
                                levels={levels}
                                typeStudents={typeStudents}
                                roles={roles}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-6">
                            {isStudentProfile && (
                                <div className="p-4 bg-white border shadow border-blueTec/20 sm:rounded-lg sm:p-8">
                                    <header>
                                        <h2 className="text-lg font-medium text-gray-900">
                                            Historial Académico
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-600 mb-4">
                                            Consulta el Kardex de calificaciones
                                            ordinarias y acreditaciones de este
                                            alumno.
                                        </p>
                                    </header>
                                    <Link
                                        href={route(
                                            "profiles.kardex",
                                            safeUser.id,
                                        )}
                                        className="inline-flex items-center px-4 py-2 bg-[#1B396A] border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-[#142952] transition ease-in-out duration-150 shadow-sm"
                                    >
                                        Ver Kardex Académico
                                    </Link>
                                </div>
                            )}

                            <div className="p-4 bg-white border shadow border-blueTec/20 sm:rounded-lg sm:p-8">
<<<<<<< HEAD
                                <UpdatePasswordForm className="w-full" user={user} />
                            </div>

                            <div className="p-4 bg-white border shadow border-orangeTec/25 sm:rounded-lg sm:p-8">
                                <DeleteUserForm className="w-full" user={user} />
=======
                                <UpdatePasswordForm
                                    className="w-full"
                                    user={safeUser}
                                />
>>>>>>> 13b3c214f902014e815b9a52a90fca8d0d409d35
                            </div>

                            <div className="p-4 bg-white border shadow border-orangeTec/25 sm:rounded-lg sm:p-8">
                                <DeleteUserForm
                                    className="w-full"
                                    user={safeUser}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Files documents={userDocuments} onOpenDocumentForm={openDocumentForm} />
                    </div>
                </div>
            </div>

            <FileForm
                show={showFileForm}
                onClose={closeDocumentForm}
                title="Detalle del documento"
                document={selectedDocument}
                statusOptions={documentStatuses}
            />

            <ModalAlert
                isOpen={flashModal.isOpen}
                onClose={closeFlashModal}
                type={flashModal.type}
                title={flashModal.title}
                message={flashModal.message}
            />
        </AuthenticatedLayout>
    );
}
