import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ModalAlert from "@/Components/ui/ModalAlert";
import useFlashAlert from "@/Hooks/useFlashAlert";

export default function Profile({ user, degrees, levels, typeStudents }) {
    const { flashModal, closeFlashModal } = useFlashAlert();

    const onDeleteUser = () => {
        switch (currentView) {
            case 'alumnos':
                router.delete(route('students.delete', itemId), {
                    onSuccess: () => setItemToDelete(null), // Cerramos el modal si tiene éxito
                });
                break;
            case 'maestros':
                router.delete(route('teachers.delete', itemId), {
                    onSuccess: () => setItemToDelete(null), // Cerramos el modal si tiene éxito
                });
                break;
        }
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">
                Perfil
            </h2>}
        >
            <Head title="Profile" />
            <div className="py-12">
                <div className="mx-auto space-y-6 max-w-7xl sm:px-6 lg:px-8">
                    <div className="p-4 bg-white shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            user={user}
                            degrees={degrees}
                            levels={levels}
                            typeStudents={typeStudents}
                            className="max-w-xl"
                        />
                    </div>
                    <div className="p-4 bg-white shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="p-4 bg-white shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
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

