import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ModalAlert from '@/Components/ui/ModalAlert';
import useFlashAlert from '@/Hooks/useFlashAlert';
import FileInputForm from '@/Components/Forms/FIleInputForm';

/**
 * Vista principal del perfil del usuario autenticado.
 *
 * Distribución:
 * - Columna izquierda: actualización de información del perfil.
 * - Columna derecha: acciones secundarias (contraseña y espacio reservado).
 *
 * También integra el feedback global con ModalAlert a partir de mensajes flash.
 *
 * @param {Object} props
 * @param {boolean} props.mustVerifyEmail Indica si el usuario requiere verificación de correo.
 * @param {string|null} props.status Estado de operaciones relacionadas con verificación.
 */
export default function Edit({ mustVerifyEmail, status }) {
    // Normaliza los mensajes flash del backend para mostrarlos en un modal consistente.
    const { flashModal, closeFlashModal } = useFlashAlert();

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Perfil de usuario
                </h2>
            }
        >
            <Head title="Profile" />

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
                            <FileInputForm
                                name="file"
                                label="Documento de identidad"
                                accept=".pdf,.jpg,.jpeg,.png"
                                helperText="Da clic aquí para buscar"
                                buttonText="Seleccionar archivo"
                                description="Sube tus documentos. Formatos permitidos: PDF, JPG, JPEG y PNG."
                            />
                        </div>
                    </div>
                </div>
            </div>

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
