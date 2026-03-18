import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { usePermission } from "@/Utils/auth";

export default function Profile({ user }) {

    const { hasRole } = usePermission();

    const isAdmin = hasRole('admin');

    const profile = user.profile;
    
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">
                Perfil
            </h2>}
        >
            <Head title="Profile" />
            {profile}
            <div className="py-12">
                <div className="mx-auto space-y-6 max-w-7xl sm:px-6 lg:px-8">
                    <div className="p-4 bg-white shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            user={user}
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
        </AuthenticatedLayout>
    );
}
