import { Link } from '@inertiajs/react';
import ResponsiveNavLink from '@/Components/Menus/Navbar/Links/ResponsiveNavLink';

/**
 * Drawer lateral para navegación móvil.
 *
 * Contrato de datos esperado en links:
 * - Forma A: { href, title, active }
 * - Forma B: { route, label, active }
 *
 * Ejemplo de uso:
 * <Sidebar links={[{ href: '/dashboard', title: 'Dashboard', active: true }]} isOpen={isOpen} />
 */
export default function Sidebar({
    links = [],
    isOpen,
    onToggle,
    onNavigate,
    user,
    profileHref,
    logoutHref,
}) {
    const normalizedLinks = links.map((link, index) => ({
        key: link.key ?? link.route ?? link.url ?? `sidebar-link-${index}`,
        href: link.href ?? link.url ?? '#',
        title: link.title ?? link.label ?? `Enlace ${index + 1}`,
        active: Boolean(link.active),
    }));

    return (
        <>
            <div
                className={`fixed inset-0 z-40 xl:hidden transition-opacity duration-300 ${
                    isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                }`}
                aria-hidden={!isOpen}
            >
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => onToggle?.(false)}
                />

                <aside
                    className={`absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-blueTec text-white shadow-2xl transition-transform duration-300 ${
                        isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex items-center justify-between border-b border-blueTec/30 p-5">
                        <div>
                            <h2 className="text-lg font-bold tracking-wide">SAACLE</h2>
                            {user?.name && (
                                <p className="text-xs text-white/70">{user.name}</p>
                            )}
                        </div>

                        <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
                            onClick={() => onToggle?.(false)}
                            aria-label="Cerrar menú"
                        >
                            <span className="text-xl leading-none">×</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                        <div className="space-y-1">
                            {normalizedLinks.map((link) => (
                                <Link
                                    key={link.key}
                                    href={link.href}
                                    className={`block rounded-md px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                                        link.active
                                            ? 'bg-orangeTec text-white shadow-sm'
                                            : 'text-gray-200 hover:bg-blueTec/80 hover:text-white'
                                    }`}
                                    onClick={() => {
                                        onNavigate?.();
                                        onToggle?.(false);
                                    }}
                                >
                                    {link.title}
                                </Link>
                            ))}
                        </div>

                        {(profileHref || logoutHref) && (
                            <div className="mt-6 border-t border-white/10 pt-4">
                                <div className="px-1 pb-3">
                                    <p className="text-sm font-semibold text-white">
                                        {user?.name || 'Usuario'}
                                    </p>
                                    <p className="text-xs text-white/70">
                                        {user?.email || ''}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    {profileHref && (
                                        <ResponsiveNavLink
                                            href={profileHref}
                                            className="text-white hover:text-orangeTec"
                                            onClick={() => {
                                                onNavigate?.();
                                                onToggle?.(false);
                                            }}
                                        >
                                            Perfil
                                        </ResponsiveNavLink>
                                    )}

                                    {logoutHref && (
                                        <ResponsiveNavLink
                                            method="post"
                                            href={logoutHref}
                                            as="button"
                                            className="text-white hover:text-orangeTec"
                                            onClick={() => {
                                                onNavigate?.();
                                                onToggle?.(false);
                                            }}
                                        >
                                            Cerrar Sesión
                                        </ResponsiveNavLink>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </>
    );
}
