import ResponsiveNavLink from "@/Components/Menus/Navbar/Links/ResponsiveNavLink";

/**
 * Navbar responsive para menu movil.
 *
 * Contrato de links esperado:
 * - { route, label }
 */
export default function ResponsiveNavbar({ links = [] }) {
    return (
        <div className="space-y-1 bg-blueTec/80 pb-3 pt-2">
            {links.map((link) => (
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