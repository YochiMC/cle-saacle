import {
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLegend,
    FieldSet,
} from '@/Components/ui/field';
import ButtonForm from '@/Components/Forms/ButtonForm';
import InputForm from '@/Components/Forms/InputForm';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '', user }) {
    const passwordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('users.password.update', user.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-blueTec">
                    Actualizar contraseña
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Asegurese de que la cuenta tenga una contraseña larga y segura.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6">
                <FieldGroup>
                    <FieldSet>
                        <FieldLegend>Cambiar contraseña</FieldLegend>
                        <FieldDescription>
                            Establece una contraseña robusta y segura para esta cuenta.
                        </FieldDescription>

                        <InputForm
                            label="Nueva contraseña"
                            inputId="password"
                            type="password"
                            placeholder="Escribe una contraseña segura"
                            description="Usa una combinación de letras, números y símbolos."
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                            ref={passwordInput}
                        />
                        <FieldError>
                            {errors.password}
                        </FieldError>

                        <InputForm
                            label="Confirmar contraseña"
                            inputId="password_confirmation"
                            type="password"
                            placeholder="Repite la contraseña"
                            description="Debe coincidir exactamente con la contraseña anterior."
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                        />
                        <FieldError>
                            {errors.password_confirmation}
                        </FieldError>
                    </FieldSet>

                    <div className="flex items-center justify-between gap-3">
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
                            <p className="text-sm font-medium text-blueTec">
                                Cambios guardados.
                            </p>
                        </Transition>
                    </div>
                </FieldGroup>
            </form>
        </section>
    );
}
