import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ModalAlert from "@/Components/ui/ModalAlert";
import useFlashAlert from "@/Hooks/useFlashAlert";
import Files from './Partials/Files';

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
 * @param {Array} [props.documents=[]] Documentos asociados al usuario.
 */
export default function Profile({ roles, user, degrees, levels, typeStudents, documents = [] }) {
    const { flashModal, closeFlashModal } = useFlashAlert();
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">
                Perfil de usuario
            </h2>}
        >
            <Head title="Perfil de usuario" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="p-4 bg-white border shadow border-blueTec/20 lg:col-span-2 sm:rounded-lg sm:p-8">
                            <UpdateProfileInformationForm
                                user={user}
                                degrees={degrees}
                                levels={levels}
                                typeStudents={typeStudents}
                                roles={roles}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 bg-white border shadow border-blueTec/20 sm:rounded-lg sm:p-8">
                                <UpdatePasswordForm className="w-full" user={user} />
                            </div>

                            <div className="p-4 bg-white border shadow border-orangeTec/25 sm:rounded-lg sm:p-8">
                                <DeleteUserForm className="w-full" user={user} />
                            </div>

                        </div>
                    </div>

                    <div className="mt-6">
                        <Files documents={documents} />
                    </div>
                </div>
            </div>

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

