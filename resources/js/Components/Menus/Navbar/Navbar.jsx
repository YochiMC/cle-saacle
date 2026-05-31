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
 * @param {string} [links[].route] - Nombre de la ruta en Inertia (ej: 'dashboard', 'users').
 * @param {Array|Object} [links[].routeParams] - Parámetros opcionales para rutas dinámicas.
 * @param {string} [links[].href] - URL absoluta o relativa ya resuelta por el layout.
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

    const hasNamedRoute = (name) => {
        if (!name) return false;

        try {
            return typeof route === 'function' && route().has(name);
        } catch {
            return false;
        }
    };

    const protectedLinks = links.filter((link) => {
        // Verifica si el usuario actual tiene alguno de los roles permitidos en el link
        const hasAllowedRole = link.allowedRoles.some((role) => hasRole(role));
        if (!hasAllowedRole) return false;

        // Evita construir links de rutas deshabilitadas por entorno.
        return link.href ? true : hasNamedRoute(link.route);
    });

    return (
        <div className="hidden space-x-8 xl:-my-px xl:ms-10 xl:flex">
            {protectedLinks.map((link) =>
                <NavLink
                    key={link.route}
                    href={link.href ?? route(link.route, link.routeParams)}
                    active={link.route ? route().current(link.route) : false}
                    className="text-white hover:text-orangeTec"
                >
                    {link.label}
                </NavLink>
            )}
        </div>
    )
}
