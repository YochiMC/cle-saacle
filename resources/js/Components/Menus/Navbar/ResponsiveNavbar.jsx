import ResponsiveNavLink from "@/Components/Menus/Navbar/Links/ResponsiveNavLink";
import { usePermission } from '@/Utils/auth';

/**
 * Navbar responsive para menú móvil con validación de roles.
 *
 * @component
 * @description
 * Renderiza un menú navegable responsivo que filtra links según los
 * roles del usuario autenticado. Solo muestra opciones para las que
 * el usuario tiene permisos.
 *
 * @param {Array<Object>} links - Array de configuración de links de navegación.
 * @param {string} links[].route - Nombre de la ruta (ej: 'dashboard').
 * @param {string} links[].label - Etiqueta visible del link.
 * @param {Array<string>} links[].allowedRoles - Roles permitidos para ver este link.
 *
 * @returns {React.ReactElement} Contenedor con links filtrados por rol.
 *
 * @example
 * const links = [
 *   { route: 'dashboard', label: 'Dashboard', allowedRoles: ['admin', 'teacher', 'student'] },
 *   { route: 'users', label: 'Usuarios', allowedRoles: ['admin'] }
 * ];
 * <ResponsiveNavbar links={links} />
 */
export default function ResponsiveNavbar({ links = [] }) {
    const { hasRole } = usePermission();

    const protectedLinks = links.filter(link => {
        // Verifica si el usuario actual tiene alguno de los roles permitidos en el link
        return link.allowedRoles.some(role => hasRole(role));
    });

    return (
        <div className="pt-2 pb-3 space-y-1 bg-blueTec/80">
            {protectedLinks.map((link) => (
                <ResponsiveNavLink
                    key={link.route}
                    href={route(link.route)}
                    active={route().current(link.route)}
                    className="text-white hover:text-orangeTec"
                >
                    {link.label}
                </ResponsiveNavLink>
            ))}
        </div>
    )
}
