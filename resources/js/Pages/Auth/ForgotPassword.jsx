import InputError from '@/Components/ui/InputError';
import InputLabel from '@/Components/ui/InputLabel';
import PrimaryButton from '@/Components/ui/PrimaryButton';
import TextInput from '@/Components/ui/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Recuperar contraseña" />

            <div className="mb-4 space-y-1 text-sm text-gray-600">
                <h1 className="text-base font-semibold text-gray-900">
                    Recuperar contraseña
                </h1>
                <p className="leading-5">
                    Escribe tu correo institucional y te enviaremos un enlace
                    para crear una nueva contraseña.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <InputLabel htmlFor="email" value="Correo" />
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton
                        className="w-full sm:ms-4 sm:w-auto"
                        disabled={processing}
                    >
                        Enviar enlace de recuperación
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}

