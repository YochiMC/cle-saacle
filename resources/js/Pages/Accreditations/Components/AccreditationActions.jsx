import React from "react";
import { Link, usePage } from "@inertiajs/react";
import ThemeButton from "@/Components/ui/ThemeButton";
import { Edit, Eye, Trash2, X, Download } from "lucide-react";

/**
 * Componente: AccreditationActions
 *
 * Renderiza los botones de acción para cada fila de la tabla de acreditaciones.
 */
const AccreditationActions = ({
    item,
    isEditingRow,
    handleEditRow,
    handleCancelRowEdit,
    requestSuspendRow,
}) => {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.roles?.some((role) => role.name === "admin");
    const isCoordinator = auth?.user?.roles?.some(
        (role) => role.name === "coordinator",
    );
    return (
        <div className="flex items-center justify-center gap-2">
            <ThemeButton
                onClick={() =>
                    isEditingRow ? handleCancelRowEdit() : handleEditRow(item)
                }
                theme={isEditingRow ? "outline" : "warning"}
                icon={isEditingRow ? X : Edit}
                title={isEditingRow ? "Cancelar edición" : "Editar"}
                className="flex items-center justify-center w-8 h-8 p-0 !px-0"
            />

            <Link href={route("profiles", item.user_id)}>
                <ThemeButton
                    theme="institutional"
                    icon={Eye}
                    title="Ver Perfil"
                    className="flex items-center justify-center w-8 h-8 p-0 !px-0 bg-blue-600 hover:bg-blue-700"
                />
            </Link>

            <ThemeButton
                theme="danger"
                icon={Trash2}
                onClick={() => requestSuspendRow(item)}
                title="Suspender Candidato"
                className="flex items-center justify-center w-8 h-8 p-0 !px-0"
            />

            {String(item.status).toLowerCase() === "accredited" &&
                (isAdmin || isCoordinator) && (
                <a
                    href={route("accreditations.certificate", item.id)}
                >
                    <ThemeButton
                        theme="success"
                        icon={Download}
                        title="Personalizar y Descargar Constancia"
                        className="flex items-center justify-center w-8 h-8 p-0 !px-0 bg-orangeTec hover:bg-orangeTec/90"
                    />
                </a>
            )}
        </div>
    );
};

export default React.memo(AccreditationActions);
