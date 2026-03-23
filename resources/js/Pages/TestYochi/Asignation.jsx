import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from '@inertiajs/react';

export default function Asignation({ users, roles, permissions }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Roles y Permisos</h2>}
        >
            <Head title="Roles y Permisos" />
            {roles.map((role) => (
                <div key={role.id}>
                    <b>{role.name}</b>
                    <ul>
                        {role.permissions.map((permission) => (
                            <li key={permission.id}>{permission.name}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </AuthenticatedLayout>
    )
}
