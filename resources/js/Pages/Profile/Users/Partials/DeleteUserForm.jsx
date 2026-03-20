import DangerButton from '@/Components/DangerButton';
import ConfirmModal from '@/Components/ConfirmModal';
import {
    FieldDescription,
    FieldLegend,
    FieldSet,
} from '@/Components/ui/field';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function DeleteUserForm({ className = '', user }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);

    const {
        delete: destroy,
        processing,
    } = useForm({});

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = () => {
        if (processing) return;

        // Flujo centralizado: la lógica de negocio vive en ProfileController@delete.
        destroy(route('profiles.delete', user.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    }

    const closeModal = () => {
        setConfirmingUserDeletion(false);
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-orangeTec">
                    Borrar cuenta
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Una vez que la cuenta este borrada, ya no hay vuelta atrás, aseguresé de guardar
                    los datos del usuario o estar seguro de que sus datos ya no sirvan de algo.
                </p>
            </header>

            <FieldSet className="p-4 border rounded-lg border-orangeTec/30 bg-orangeTec/5">
                <FieldDescription>
                    Esta acción realiza una eliminación lógica del usuario y su perfil asociado.
                </FieldDescription>
                <DangerButton onClick={confirmUserDeletion}>
                    Borrar cuenta
                </DangerButton>
            </FieldSet>

            <ConfirmModal
                isOpen={confirmingUserDeletion}
                onClose={closeModal}
                onConfirm={deleteUser}
                title="¿Estás seguro de borrar la cuenta?"
                message="Una vez que la cuenta este borrada, ya no hay vuelta atrás. Asegúrate de guardar los datos del usuario o confirmar que ya no son necesarios."
                confirmText={processing ? 'Eliminando...' : 'Borrar cuenta'}
                variant="warning"
            />
        </section>
    );
}
