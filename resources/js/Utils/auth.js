import { usePage } from '@inertiajs/react';

/**
 * FUNCIONES PURAS (Utilidades)
 * Úsalas fuera de componentes React o en archivos JS puros.
 */
export const checkCan = (permission, auth) => {
    if (!auth || !auth.permissions) return false; // Seguridad extra
    return auth.permissions.includes(permission);
};

export const checkRole = (role, auth) => {
    if (!auth || !auth.roles) return false; // Seguridad extra
    return auth.roles.includes(role);
};

/**
 * HOOK PERSONALIZADO
 * Úsalo dentro de tus componentes de React.
 * No necesitas pasarle 'auth' porque lo obtiene automáticamente de la sesión.
 */
export function usePermission() {
    const { auth } = usePage().props;

    return {
        can: (permission) => checkCan(permission, auth),
        hasRole: (role) => checkRole(role, auth),
        // Útil para depuración:
        allPermissions: auth.permissions,
        allRoles: auth.roles,
    };
}