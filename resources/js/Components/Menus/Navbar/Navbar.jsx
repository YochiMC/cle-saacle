import NavLink from "@/Components/Menus/Navbar/Links/NavLink";

/**
 * Navbar principal para pantallas sm+.
 *
 * Contrato de links esperado:
 * - { route, label }
 *
 * El estado activo se calcula con route().current(routeName).
 */
export default function Navbar({ links = [] }) {
    return (
        <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
            {links.map((link) =>
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
