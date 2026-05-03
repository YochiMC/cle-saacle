import ButtonForm from '@/Components/Forms/ButtonForm';
import FormModal from '@/Components/Forms/FormModal';
import InputForm from '@/Components/Forms/InputForm';
import ConfirmModal from '@/Components/ui/ConfirmModal';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/Components/ui/field';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Flujo de eliminación de cuenta en dos pasos:
 * 1) Confirmación explícita con ConfirmModal.
 * 2) Validación final de contraseña dentro de FormModal.
 *
 * @param {Object} props
 * @param {string} [props.className] Clases CSS adicionales para el contenedor.
 */
export default function DeleteUserForm({ className = '' }) {
    // Paso 1: confirmación de intención.
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    // Paso 2: captura segura de contraseña.
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    // Ejecuta la eliminación contra el endpoint protegido por current_password.
    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

    const proceedToPasswordStep = () => {
        setConfirmingUserDeletion(false);
        setShowPasswordModal(true);
    };

    // Cierre unificado para limpiar estado visual y errores de validación.
    const closeModal = () => {
        setConfirmingUserDeletion(false);
        setShowPasswordModal(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Delete Account
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <Button
                type="button"
                variant="destructive"
                onClick={confirmUserDeletion}
            >
                Eliminar cuenta
            </Button>

            <ConfirmModal
                isOpen={confirmingUserDeletion}
                onClose={closeModal}
                onConfirm={proceedToPasswordStep}
                title="¿Deseas eliminar tu cuenta?"
                message="Esta acción eliminará de forma permanente tu cuenta y toda su información asociada."
                confirmText="Continuar"
                variant="danger"
            />

            <FormModal
                show={showPasswordModal}
                onClose={closeModal}
                title="Confirma tu contraseña"
            >
                <form onSubmit={deleteUser} className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Para finalizar, escribe tu contraseña actual.
                    </p>

                    <div>
                        <InputForm
                            inputId="password"
                            label="Contraseña"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Escribe tu contraseña"
                        />
                        <FieldError>{errors.password}</FieldError>
                    </div>

                    <ButtonForm
                        submitLabel="Eliminar cuenta"
                        cancelLabel="Cancelar"
                        onCancel={closeModal}
                        isLoading={processing}
                        tone="warning"
                    />
                </form>
            </FormModal>
        </section>
    );
}
