import { Head, Link } from '@inertiajs/react';

export default function ErrorPage({ status, message }) {
    // Mensajes por código para mantener una UX clara y homogénea.
    const descriptions = {
        403: 'Lo sentimos, no tienes permisos para acceder a este recurso.',
        404: 'La página que buscas no existe o ha sido movida.',
        500: 'Algo salió mal en nuestros servidores. Estamos trabajando en ello.',
    }[status] || 'Ha ocurrido un error inesperado.';

    const title = status === 403 ? '¡Acceso denegado!' : '¡Ups! Algo salió mal';

    return (
        <>
            <Head title={`Error ${status}`} />
            <div className="relative flex min-h-screen flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
                <div className="absolute -z-10 select-none text-9xl font-extrabold text-primary/20">
                    {status}
                </div>
                <h1 className="mt-10 text-4xl font-bold text-gray-900 dark:text-white">
                    {title}
                </h1>
                <p className="max-w-md mt-4 text-lg text-gray-600 dark:text-gray-400">
                    {message || descriptions}
                </p>
                <Link
                    href="/"
                    className="px-6 py-3 mt-8 font-medium text-white transition-all rounded-lg shadow-lg bg-primary hover:bg-primary/90"
                >
                    Volver al inicio
                </Link>
            </div>
        </>
    );
}