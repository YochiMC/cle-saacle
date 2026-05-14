import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ErrorPage({ status, message }) {
    // Diccionario para personalizar el diseño según el código
    const descriptions = {
        403: 'Lo sentimos, no tienes permisos para acceder a este recurso.',
        404: 'La página que buscas no existe o ha sido movida.',
        500: 'Algo salió mal en nuestros servidores. Estamos trabajando en ello.',
    }[status] || 'Ha ocurrido un error inesperado.';

    return (
        <AuthenticatedLayout>
            <Head title={`Error ${status}`} />
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="text-9xl font-extrabold text-primary/20 absolute -z-10 select-none">
                    {status}
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-10">
                    {status === 403 ? '¡Acceso Denegado!' : '¡Ups! Algo salió mal'}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-md">
                    {message || descriptions}
                </p>
                <Link 
                    href={route('dashboard')} 
                    className="mt-8 px-6 py-3 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 transition-all font-medium"
                >
                    Regresar al Dashboard
                </Link>
            </div>
        </AuthenticatedLayout>
    );
}