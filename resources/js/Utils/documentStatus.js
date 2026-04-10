const DOCUMENT_STATUS_META = {
    approved: {
        label: 'Aprobado',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    rejected: {
        label: 'Rechazado',
        className: 'border-rose-200 bg-rose-50 text-rose-700',
    },
    pending: {
        label: 'Pendiente',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },
};

/**
 * Devuelve la configuración visual para un estado de documento.
 *
 * @param {string|null|undefined} status
 * @returns {{label: string, className: string}}
 */
export function getDocumentStatusMeta(status) {
    return DOCUMENT_STATUS_META[status] ?? DOCUMENT_STATUS_META.pending;
}

/**
 * Formatea una fecha de documento en locale es-MX.
 *
 * @param {string|null|undefined} dateValue
 * @returns {string}
 */
export function formatDocumentDate(dateValue) {
    if (!dateValue) {
        return 'Sin fecha';
    }

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'Sin fecha';
    }

    return parsedDate.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}
