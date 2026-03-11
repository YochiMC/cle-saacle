// resources/js/Utils/auth.js

// La lógica base (tu código actual)
export const checkCan = (permission, auth) => {
    return auth?.permissions?.includes(permission) ?? false;
};

export const checkRole = (role, auth) => {
    return auth?.roles?.includes(role) ?? false;
};

// El Hook que usa esa lógica (para componentes React)
import { usePage } from '@inertiajs/react';

export function usePermission() {
    const { auth } = usePage().props;

    return {
        can: (p) => checkCan(p, auth),
        hasRole: (r) => checkRole(r, auth),
    };
}