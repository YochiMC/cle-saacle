export function can(permission, props) {
    return props.auth.permissions.includes(permission);
}

export function hasRole(role, props) {
    return props.auth.roles.includes(role);
}
