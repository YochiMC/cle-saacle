import ButtonForm from '@/Components/Forms/ButtonForm';
import InputForm from '@/Components/Forms/InputForm';
import ModalAlert from '@/Components/ui/ModalAlert';
import { FieldError } from '@/Components/ui/field';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Formulario para actualización de contraseña del usuario autenticado.
 *
 * Incluye feedback inmediato con ModalAlert para éxito y errores de validación.
 *
 * @param {Object} props
 * @param {string} [props.className] Clases CSS adicionales para el contenedor.
 */
export default function UpdatePasswordForm({ className = '' }) {
    // Estado local del modal de feedback para comunicar el resultado del submit.
    const [feedbackModal, setFeedbackModal] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
    });

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Envía la actualización de contraseña y normaliza mensajes de error.
    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                const message =
                    errors.current_password ||
                    errors.password ||
                    errors.password_confirmation ||
                    'No se pudo actualizar la contraseña.';

                setFeedbackModal({
                    isOpen: true,
                    type: 'error',
                    title: 'Error al actualizar',
                    message,
                });

                if (errors.password) {
                    reset('password', 'password_confirmation');
                }

                if (errors.current_password) {
                    reset('current_password');
                }
            },
        });
    };

    // Abre confirmación cuando Inertia reporta éxito reciente.
    useEffect(() => {
        if (!recentlySuccessful) return;

        setFeedbackModal({
            isOpen: true,
            type: 'success',
            title: 'Contraseña actualizada',
            message: 'La contraseña se actualizó correctamente.',
        });
    }, [recentlySuccessful]);

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Actualizar contraseña
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Asegurate de que la contraseña sea larga y segura
                    para mantener tu cuenta protegida. Se recomienda usar una combinación de letras, números
                    y carácteres especiales.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                {/* Credencial actual para validar identidad */}
                <div>
                    <InputForm
                        label="Contraseña actual"
                        inputId="current_password"
                        type="password"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                    />
                    <FieldError>{errors.current_password}</FieldError>
                </div>

                <div>
                    {/* Nueva contraseña */}
                    <InputForm
                        label="Nueva contraseña"
                        inputId="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                    />
                    <FieldError>{errors.password}</FieldError>
                </div>

                <div>
                    {/* Confirmación para evitar errores de captura */}
                    <InputForm
                        label="Confirmar contraseña"
                        inputId="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                    />
                    <FieldError>{errors.password_confirmation}</FieldError>
                </div>

                <div className="flex items-center gap-4">
                    <ButtonForm
                        submitLabel="Guardar"
                        cancelLabel="Limpiar"
                        onCancel={() => reset()}
                        isLoading={processing}
                        tone="institutional"
                    />

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Guardado.</p>
                    </Transition>
                </div>
            </form>

            <ModalAlert
                isOpen={feedbackModal.isOpen}
                onClose={() =>
                    setFeedbackModal((prev) => ({
                        ...prev,
                        isOpen: false,
                    }))
                }
                type={feedbackModal.type}
                title={feedbackModal.title}
                message={feedbackModal.message}
            />
        </section>
    );
}
