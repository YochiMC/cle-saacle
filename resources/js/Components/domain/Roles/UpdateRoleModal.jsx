import FormModal from "@/Components/Forms/FormModal"
import { FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet } from '@/Components/ui/field';
import InputForm from "@/Components/Forms/InputForm";
import CheckboxForm from "@/Components/Forms/CheckboxForm";
import ButtonForm from "@/Components/Forms/ButtonForm";
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Modal de alta/edición de roles.
 * Mantiene la lógica de formulario local y expone un callback opcional para integrar backend desde la Page.
 */
export default function UpdateRoleModal({ permissions = [], title, show, onClose, role }) {
    const initialPermissionIds = Array.isArray(role?.permissions)
        ? role.permissions.map((permission) => (typeof permission === 'object' ? permission?.id : permission)).filter((id) => id != null)
        : [];

    const { data, setData, put, processing, errors } = useForm({
        name: role?.name ?? '',
        permissions: initialPermissionIds,
    });

    const selectedPermissions = Array.isArray(data.permissions) ? data.permissions : [];
    const permissionItemError = Object.keys(errors).find((key) => key.startsWith('permissions.'));

    useEffect(() => {
        const nextPermissionIds = Array.isArray(role?.permissions)
            ? role.permissions.map((permission) => (typeof permission === 'object' ? permission?.id : permission)).filter((id) => id != null)
            : [];

        setData({
            name: role?.name ?? '',
            permissions: nextPermissionIds,
        });
    }, [role, setData]);

    const isSystemRole = role?.is_system === true;

    const handlePermissionChange = (permissionId, isChecked) => {
        const current = selectedPermissions;
        const currentAsString = current.map((id) => String(id));
        const targetAsString = String(permissionId);

        if (isChecked && !currentAsString.includes(targetAsString)) {
            setData('permissions', [...current, permissionId]);
            return;
        }

        if (!isChecked) {
            setData('permissions', current.filter((id) => String(id) !== targetAsString));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!role?.id || isSystemRole) {
            return;
        }

        put(route("roles.update", role.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <FormModal
            title={title}
            show={show}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    {!isSystemRole && (
                        <FieldSet>
                            <InputForm
                                label="Nombre del rol"
                                inputId="role-name"
                                name="name"
                                placeholder="Ejemplo: Coordinador académico"
                                description="Este nombre se mostrará en el sistema al asignar el rol a usuarios."
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <FieldError>{errors.name}</FieldError>
                            <FieldSeparator />
                        </FieldSet>)}
                    <FieldSet>
                        <FieldLegend>Permisos del rol</FieldLegend>
                        <FieldDescription>
                            Selecciona los permisos que tendrá este rol. Puedes marcar uno o varios según el nivel de acceso que necesites.
                        </FieldDescription>
                        {isSystemRole && (
                            <FieldDescription>
                                Este rol pertenece al sistema y no puede modificarse desde este módulo.
                            </FieldDescription>
                        )}
                        {permissions.length === 0 ? (
                            <FieldDescription>
                                No hay permisos disponibles para seleccionar en este momento.
                            </FieldDescription>
                        ) : (
                            permissions.map((permission) => (
                                <CheckboxForm
                                    key={permission.id}
                                    label={permission.name}
                                    checkboxId={`permission-${permission.id}`}
                                    checked={selectedPermissions.map((id) => String(id)).includes(String(permission.id))}
                                    onCheckedChange={(checkedState) => handlePermissionChange(permission.id, checkedState === true)}
                                    disabled={isSystemRole || processing}
                                    tone='institutional'
                                />
                            ))
                        )}
                        <FieldDescription>
                            Permisos seleccionados: {selectedPermissions.length}
                        </FieldDescription>
                        <FieldError>{errors.permissions || (permissionItemError ? errors[permissionItemError] : null)}</FieldError>
                    </FieldSet>
                    <FieldSeparator />
                    <FieldSet>
                        <FieldError>{errors.role}</FieldError>
                        <FieldDescription>
                            Verifica la información antes de guardar. Después podrás ajustar el rol editándolo.
                        </FieldDescription>
                        <ButtonForm
                            submitLabel="Guardar rol"
                            cancelLabel="Cancelar"
                            onCancel={onClose}
                            isLoading={processing}
                            submitDisabled={isSystemRole}
                            tone="institutional"
                        />
                    </FieldSet>
                </FieldGroup>
            </form>
        </FormModal>

    )
}
