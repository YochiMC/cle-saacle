/**
 * Constantes estáticas para el módulo de Acreditación.
 */

export const VIEW_OPTIONS = [
    { value: "candidatos", label: "Candidatos a Acreditación" },
];

/**
 * Mapeo de estatus del Enum StudentStatus para selects de UI.
 */
export const STATUS_SELECT_OPTIONS = [
    { value: "in_review", label: "En Revisión" },
    { value: "accredited", label: "Acreditado" },
    { value: "released", label: "Liberado" },
    { value: "suspended", label: "Suspendido" },
];

/**
 * Configuración para el modal de borrado masivo (Bulk Suspend).
 */
export const BULK_SUSPEND_MODAL_CONFIG = {
    title: "Suspender candidatos seleccionados",
    message: "Estos alumnos dejarán de ser considerados candidatos activos en el proceso de acreditación. Su estatus pasará a Suspendido de manera inmediata. ¿Estás seguro?",
    confirmText: "Sí, suspender alumnos",
    variant: "warning",
};

/**
 * Columnas a ocultar por defecto en el ResourceDashboard.
 */
export const HIDDEN_COLUMNS_DEFAULT = {
    id: false,
    user_id: false,
    status_label: false,
};
