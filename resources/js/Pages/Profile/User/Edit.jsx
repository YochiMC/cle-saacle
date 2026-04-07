import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ModalAlert from '@/Components/ui/ModalAlert';
import useFlashAlert from '@/Hooks/useFlashAlert';
import FileForm from './Partials/Forms/FileForm';
import SecondaryButton from '@/Components/SecondaryButton';
import { useState } from 'react';

/**
 * Vista principal del perfil del usuario autenticado.
 *
 * Distribución:
 * - Columna izquierda: actualización de información del perfil.
 * - Columna derecha: acciones secundarias (contraseña y documentos).
 *
 * También integra el feedback global con ModalAlert a partir de mensajes flash.
 *
 * @param {Object} props
 * @param {boolean} props.mustVerifyEmail Indica si el usuario requiere verificación de correo.
 * @param {string|null} props.status Estado de operaciones relacionadas con verificación.
 * @param {Array} props.documents Lista de documentos del usuario.
 */
export default function Edit({ mustVerifyEmail, status, documents }) {
    // Normaliza los mensajes flash del backend para mostrarlos en un modal consistente.
    const { flashModal, closeFlashModal } = useFlashAlert();
    const [isOpen, setIsOpen] = useState(false);

    console.table(documents)

    const openFileModal = () => setIsOpen(true);
    const closeFileModal = () => setIsOpen(false);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Perfil de usuario
                </h2>
            }
        >
            <Head title="Perfil de usuario" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Estructura responsiva: 1 columna en móvil, 3 columnas en escritorio */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="bg-white p-4 shadow border border-blueTec/20 lg:col-span-2 sm:rounded-lg sm:p-8">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white p-4 shadow border border-blueTec/20 sm:rounded-lg sm:p-8">
                                <UpdatePasswordForm className="w-full" />
                            </div>

                            <div className="bg-white p-4 shadow border border-blueTec/20 sm:rounded-lg sm:p-6">
                                <p className="text-sm font-semibold text-gray-800">Documentos de identidad</p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Sube INE, RFC, CURP u otros documentos personales requeridos para validación.
                                </p>
                                <div className="mt-4">
                                    <SecondaryButton onClick={openFileModal} className="w-full justify-center">
                                        Subir documento
                                    </SecondaryButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FileForm show={isOpen} onClose={closeFileModal} title="Subir documento" />

            {/* Modal de notificaciones globales para éxito, error, warning o info */}
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
