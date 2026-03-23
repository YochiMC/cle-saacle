import { Link } from '@inertiajs/react';

/**
 * Enlace reutilizable para la barra de navegacion en desktop.
 *
 * Props:
 * - active: activa estilos visuales del enlace actual.
 * - className: permite extender o sobreescribir estilos de Tailwind.
 * - children: contenido visible del enlace.
 * - props: resto de props compatibles con Link de Inertia.
 *
 * Ejemplo de uso:
 * <NavLink href="/dashboard" active={true}>Dashboard</NavLink>
 */
export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-orangeTec text-white focus:border-orangeTec'
                    : 'border-transparent text-gray-300 hover:border-orangeTec/50 hover:text-orangeTec focus:border-orangeTec/50 focus:text-orangeTec') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}
