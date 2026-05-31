import ApplicationLogo from "@/Components/ui/ApplicationLogo";
import Dropdown from "@/Components/ui/Dropdown";
import Navbar from "@/Components/Menus/Navbar/Navbar";
import Sidebar from "@/Components/Menus/Sidebar";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { usePermission } from "@/Utils/auth";

/**
 * Layout autenticado con barra de navegación integrada.
 *
 * @component
 * @description
 * Layout de envoltura para páginas protegidas después de la autenticación.
 * Incluye barra de navegación (Navbar y ResponsiveNavbar), menú de usuario
 * con opciones de perfil y cierre de sesión, y espacios para header dinámico
 * y contenido principal.
 *
 * @param {Object} props - Props del componente.
 * @param {React.ReactNode} [props.header] - Contenido opcional para el header (encima del main).
 * @param {React.ReactNode} props.children - Contenido principal de la página.
 *
 * @returns {React.ReactElement} Estructura completa de layout autenticado.
 *
 * @example
 * <AuthenticatedLayout header={<h1>Mi Página</h1>}>
 *   <div>Contenido de la página</div>
 * </AuthenticatedLayout>
 */
export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { hasRole } = usePermission();

    const hasNamedRoute = (name) => {
        if (!name) return false;

        try {
            return typeof route === "function" && route().has(name);
        } catch {
            return false;
        }
    };

    /**
     * Configuración de links de navegación con protección por roles.
     * Cada link especifica qué roles tienen permiso para verlo.
     *
     * @type {Array<Object>}
     */
    const links = [
        { route: "dashboard", label: "Dashboard", allowedRoles: ["admin", "teacher", "student"] },
        { route: "kardex", routeParams: {user: user?.id}, label: "Kardex", allowedRoles: ["student"] },
        { route: "student.enrollment", label: "Inscripción", allowedRoles: ["student"] },
        { route: "users", label: "Usuarios", allowedRoles: ["admin"] },
        { route: "groups", label: "Grupos", allowedRoles: ["admin", "teacher", "student"] },
        { route: "reports", label: "Reportes", allowedRoles: ["admin", "coordinator"] },
        { route: "accreditations", label: "Acreditaciones", allowedRoles: ["admin", "coordinator"] },
        { route: "exams.index", label: "Exámenes", allowedRoles: ["admin", "teacher", "student"] },
        { route: "settings.catalogs", label: "Catálogos", allowedRoles: ["admin"] },
        { route: "pagos", label: "Pagos", allowedRoles: ["admin", "coordinator", "student"] },
    ];

    const visibleLinks = links.filter((link) => {
        const hasAllowedRole = link.allowedRoles.some((role) => hasRole(role));

        if (!hasAllowedRole) {
            return false;
        }

        return link.href ? true : hasNamedRoute(link.route);
    });

    const mobileLinks = visibleLinks.map((link) => ({
        key: link.route,
        href: link.href ?? route(link.route, link.routeParams),
        title: link.label,
        active: link.route ? route().current(link.route) : false,
    }));

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* NavBar Azul TEC */}
            <nav className="border-b border-blueTec/30 bg-blueTec">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex items-center shrink-0">
                                <Link href="/">
                                    <ApplicationLogo className="block w-auto h-9 fill-white text-white" />
                                </Link>
                            </div>
                        </div>
                        <Navbar links={links} />
                        <div className="hidden lg:ms-6 lg:flex lg:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white transition duration-150 ease-in-out border rounded-md border-blueTec/50 bg-blueTec/80 hover:bg-blueTec hover:text-orangeTec focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route("profile.edit")}
                                        >
                                            Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                        >
                                            Cerrar Sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="flex items-center -me-2 lg:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center p-2 text-white transition duration-150 ease-in-out rounded-md hover:bg-blueTec/80 hover:text-orangeTec focus:bg-blueTec/80 focus:text-orangeTec focus:outline-none"
                                aria-label={showingNavigationDropdown ? "Cerrar menú" : "Abrir menú"}
                                aria-expanded={showingNavigationDropdown}
                            >
                                <svg
                                    fill="none"
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                        className={
                                            !showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18 18 6M6 6l12 12"
                                        className={
                                            showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <Sidebar
                    isOpen={showingNavigationDropdown}
                    onToggle={setShowingNavigationDropdown}
                    links={mobileLinks}
                    user={user}
                    profileHref={route("profile.edit")}
                    logoutHref={route("logout")}
                    onNavigate={() => setShowingNavigationDropdown(false)}
                />
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 sm:py-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="p-4 sm:p-6">{children}</main>
        </div>
    );
}

