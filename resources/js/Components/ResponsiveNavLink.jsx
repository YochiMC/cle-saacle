import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-orangeTec bg-blueTec/80 text-white focus:border-orangeTec focus:bg-blueTec focus:text-orangeTec'
                    : 'border-transparent text-gray-300 hover:border-orangeTec/50 hover:bg-blueTec/60 hover:text-orangeTec focus:border-orangeTec/50 focus:bg-blueTec/60 focus:text-orangeTec'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
