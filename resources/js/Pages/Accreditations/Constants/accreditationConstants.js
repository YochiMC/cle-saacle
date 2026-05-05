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
    { value: "disabled",  label: "Disabled" },
];

/**
 * Configuración para el modal de borrado masivo (Bulk Suspend).
 */
export const BULK_SUSPEND_MODAL_CONFIG = {
    title: "Disable selected candidates",
    message: "These students will no longer be considered active candidates in the accreditation process. Their status will change to Disabled immediately. Are you sure?",
    confirmText: "Yes, disable students",
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
