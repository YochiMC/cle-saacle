import ButtonForm from '@/Components/Forms/ButtonForm';
import InputForm from '@/Components/Forms/InputForm';
import { FieldError, FieldGroup } from '@/Components/ui/field';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

/**
 * Formulario para actualizar datos básicos del usuario autenticado.
 *
 * Este componente estandariza los campos con los componentes de Forms y
 * centraliza errores por campo usando FieldError.
 *
 * @param {Object} props
 * @param {boolean} props.mustVerifyEmail Indica si se debe mostrar el bloque de verificación de correo.
 * @param {string|null} props.status Estado devuelto por el flujo de verificación de correo.
 * @param {string} [props.className] Clases CSS adicionales para el contenedor.
 */
export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            email_recovery: user.email_recovery,
            phone: user.phone,
        });

    // Persistencia del formulario sobre el perfil del usuario autenticado.
    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Información de perfil
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Actualiza la información de tu perfil
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Bloque principal de datos personales */}
                <FieldGroup>
                    <div>
                        <InputForm
                            label="Nombre de usuario"
                            inputId="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            autoComplete="name"
                            required
                            autoFocus
                        />
                        <FieldError>{errors.name}</FieldError>
                    </div>

                    <div>
                        <InputForm
                            label="Correo"
                            inputId="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="username"
                            required
                        />
                        <FieldError>{errors.email}</FieldError>
                    </div>

                    <div>
                        <InputForm
                            label="Correo alternativo"
                            inputId="email_recovery"
                            type="email"
                            value={data.email_recovery}
                            onChange={(e) => setData('email_recovery', e.target.value)}
                            autoComplete="username"
                            required
                        />
                        <FieldError>{errors.email_recovery}</FieldError>
                    </div>

                    <div>
                        <InputForm
                            label="Número de teléfono"
                            inputId="phone"
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            autoComplete="tel"
                            required
                        />
                        <FieldError>{errors.phone}</FieldError>
                    </div>
                </FieldGroup>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        {/* Mensaje auxiliar para reenviar enlace de verificación */}
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <ButtonForm
                        submitLabel="Guardar"
                        isLoading={processing}
                        showCancel={false}
                        tone="institutional"
                    />

                    {/* Confirmación visual breve después de guardar correctamente */}
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Guardado.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
