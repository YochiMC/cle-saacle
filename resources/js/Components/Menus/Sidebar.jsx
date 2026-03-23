import { Link } from '@inertiajs/react';

/**
 * Sidebar lateral para escritorio y moviles.
 *
 * Contrato de datos esperado en links:
 * - Forma A: { url, title, active }
 * - Forma B: { route, label, active }
 *
 * Ejemplo de uso:
 * <Sidebar
 *   links={[{ url: '/dashboard', title: 'Dashboard', active: true }]}
 *   isOpen={isOpen}
 *   onToggle={setIsOpen}
 * />
 */
export default function Sidebar({ links = [], isOpen, onToggle }) {
    const normalizedLinks = links.map((link, index) => ({
        key: link.key ?? link.route ?? link.url ?? `sidebar-link-${index}`,
        href: link.url ?? '#',
        title: link.title ?? link.label ?? `Enlace ${index + 1}`,
        active: Boolean(link.active),
    }));

    return (
        <>
            {/* Overlay (móviles) */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => onToggle?.(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen md:bg-blueTec md:text-white md:shadow-lg md:fixed md:left-0 md:top-0">
                {/* Logo/Título */}
                <div className="p-6 border-b border-blueTec/30">
                    <h2 className="text-2xl font-bold tracking-wide">SAACLE</h2>
                </div>

                {/* Lista de enlaces */}
                <ul className="flex flex-col space-y-1 mt-6 flex-grow px-3">
                    {normalizedLinks.map((link) => (
                        <li key={link.key}>
                            <Link
                                href={link.href}
                                className={`block px-4 py-3 rounded-md transition-colors duration-200 font-medium ${
                                    link.active
                                        ? 'bg-orangeTec text-white shadow-sm'
                                        : 'text-gray-300 hover:bg-blueTec/80 hover:text-white'
                                }`}
                            >
                                {link.title}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Footer */}
                <div className="p-6 border-t border-blueTec/30">
                    <p className="text-xs text-gray-400">© 2026 SAACLE</p>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 w-64 min-h-screen bg-blueTec text-white flex flex-col shadow-lg transition-transform duration-300 md:hidden ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo/Título */}
                <div className="p-6 border-b border-blueTec/30">
                    <h2 className="text-2xl font-bold tracking-wide">SAACLE</h2>
                </div>

                {/* Lista de enlaces */}
                <ul className="flex flex-col space-y-1 mt-6 flex-grow px-3">
                    {normalizedLinks.map((link) => (
                        <li key={link.key}>
                            <Link
                                href={link.href}
                                className={`block px-4 py-3 rounded-md transition-colors duration-200 font-medium ${
                                    link.active
                                        ? 'bg-orangeTec text-white shadow-sm'
                                        : 'text-gray-300 hover:bg-blueTec/80 hover:text-white'
                                }`}
                                onClick={() => onToggle?.(false)}
                            >
                                {link.title}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Footer */}
                <div className="p-6 border-t border-blueTec/30">
                    <p className="text-xs text-gray-400">© 2026 SAACLE</p>
                </div>
            </aside>
        </>
    );
}
