import React, { memo } from "react";

/**
 * FormErrors — Muestra la lista de errores de validación de un formulario Inertia.
 *
 * Componente presentacional compartido que elimina el bloque de error HTML
 * duplicado que existía en `GroupModal` y `ExamFormModal`.
 *
 * Si el objeto `errors` está vacío, no renderiza nada (null-safe).
 *
 * @param {Object} props
 * @param {Object} [props.errors={}] - Objeto de errores devuelto por `useForm` de Inertia.
 */
const FormErrors = memo(({ errors = {} }) => {
    const listaErrores = Object.values(errors);

    if (listaErrores.length === 0) return null;

    return (
        <div className="p-4 mb-4 text-sm text-white bg-red-500 rounded-lg" role="alert">
            <strong>Errores detectados:</strong>
            <ul className="ml-5 list-disc w-full">
                {listaErrores.map((error, i) => (
                    <li key={i}>{error}</li>
                ))}
            </ul>
        </div>
    );
});

FormErrors.displayName = "FormErrors";
export default FormErrors;
