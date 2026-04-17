import NavLink from "@/Components/Menus/Navbar/Links/NavLink";
import { usePermission } from '@/Utils/auth';

/**
 * Navbar principal para pantallas sm+ con validación de roles.
 *
 * @component
 * @description
 * Renderiza la barra de navegación horizontal para sistemas operativos
 * con pantallas medianas o mayores (sm+). Filtra los links disponibles
 * según los roles asignados al usuario autenticado.
 *
 * El estado activo de cada link se calcula automáticamente usando
 * route().current(routeName) para resaltar la página actual.
 *
 * @param {Array<Object>} links - Array de configuración de links de navegación.
 * @param {string} links[].route - Nombre de la ruta en Inertia (ej: 'dashboard', 'users').
 * @param {string} links[].label - Etiqueta visible del link en la UI.
 * @param {Array<string>} links[].allowedRoles - Array de roles permitidos para acceder al link.
 *
 * @returns {React.ReactElement} Contenedor con links horizontales filtrados por rol.
 *
 * @example
 * const links = [
 *   { route: 'dashboard', label: 'Dashboard', allowedRoles: ['admin', 'teacher', 'student'] },
 *   { route: 'users', label: 'Usuarios', allowedRoles: ['admin'] },
 *   { route: 'reports', label: 'Reportes', allowedRoles: ['admin', 'teacher'] }
 * ];
 * <Navbar links={links} />
 */
export default function Navbar({ links = [] }) {
    const { hasRole } = usePermission();

    const protectedLinks = links.filter(link => {
        // Verifica si el usuario actual tiene alguno de los roles permitidos en el link
        return link.allowedRoles.some(role => hasRole(role));
    });
    return (
        <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
            {protectedLinks.map((link) =>
                <NavLink
                    key={link.route}
                    href={route(link.route)}
                    active={route().current(link.route)}
                    className="text-white hover:text-orangeTec"
                >
                    {link.label}
                </NavLink>
            )}
        </div>
    )
}
