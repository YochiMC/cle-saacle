import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ModalAlert from "@/Components/ui/ModalAlert";
import useFlashAlert from "@/Hooks/useFlashAlert";

export default function Profile({ roles, user, degrees, levels, typeStudents }) {
    const { flashModal, closeFlashModal } = useFlashAlert();
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">
                Perfil
            </h2>}
        >
            <Head title="Profile" />
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

