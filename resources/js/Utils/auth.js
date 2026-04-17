import { usePage } from '@inertiajs/react';

/**
 * FUNCIONES PURAS (Utilidades)
 * Úsalas fuera de componentes React o en archivos JS puros.
 */

/**
 * Verifica si el objeto de autenticación contiene un permiso específico.
 *
 * @param {string} permission - Nombre del permiso a verificar (ej: 'view.users', 'delete.exam').
 * @param {Object|null} auth - Objeto de autenticación del usuario.
 * @param {Array<string>} auth.permissions - Lista de permisos del usuario.
 *
 * @returns {boolean} true si el usuario tiene el permiso, false en caso contrario.
 *
 * @example
 * const hasViewUsers = checkCan('view.users', auth);
 */
export const checkCan = (permission, auth) => {
    if (!auth || !auth.permissions || !Array.isArray(auth.permissions)) {
        return false;
    }
    return auth.permissions.includes(permission);
};

/**
 * Verifica si el objeto de autenticación contiene un rol específico.
 *
 * @param {string} role - Nombre del rol a verificar (ej: 'admin', 'teacher', 'student').
 * @param {Object|null} auth - Objeto de autenticación del usuario.
 * @param {Array<string>} auth.roles - Lista de roles asignados al usuario.
 *
 * @returns {boolean} true si el usuario tiene el rol, false en caso contrario.
 *
 * @example
 * const isAdmin = checkRole('admin', auth);
 */
export const checkRole = (role, auth) => {
    if (!auth || !auth.roles || !Array.isArray(auth.roles)) {
        return false;
    }
    return auth.roles.includes(role);
};

/**
 * HOOK PERSONALIZADO para verificación de permisos y roles.
 *
 * @hook
 * @description
 * Hook que proporciona métodos para verificar permisos y roles del usuario
 * autenticado. Extrae automáticamente los datos de autenticación de la sesión
 * mediante usePage() de Inertia, por lo que no requiere parámetros.
 *
 * Ideal para usar dentro de componentes React para determinar qué renderizar
 * o qué funcionalidades habilitar según los permisos del usuario.
 *
 * @returns {Object} Objeto con métodos de verificación:
 * @returns {Function} .can - Verifica si el usuario tiene un permiso específico.
 * @returns {Function} .hasRole - Verifica si el usuario tiene un rol específico.
 * @returns {Array<string>} .allPermissions - Para depuración: lista completa de permisos.
 * @returns {Array<string>} .allRoles - Para depuración: lista completa de roles.
 *
 * @throws {Error} Implícitamente si auth no está disponible en la sesión.
 *
 * @example
 * // En un componente React:
 * function AdminPanel() {
 *   const { hasRole, can } = usePermission();
 *
 *   if (!hasRole('admin')) {
 *     return <p>No tienes acceso</p>;
 *   }
 *
 *   return (
 *     <div>
 *       {can('edit.users') && <button>Editar Usuarios</button>}
 *     </div>
 *   );
 * }
 */
export function usePermission() {
    const { auth } = usePage().props;

    return {
        can: (permission) => checkCan(permission, auth),
        hasRole: (role) => checkRole(role, auth),
        // Útil para depuración:
        allPermissions: auth?.permissions ?? [],
        allRoles: auth?.roles ?? [],
    };
}
