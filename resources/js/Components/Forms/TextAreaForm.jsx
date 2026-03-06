/**
 * TextAreaForm
 *
 * Componente de área de texto para formularios. Renderiza un Textarea con su
 * FieldLabel y una FieldDescription opcional. Admite uso controlado y no controlado.
 *
 * @component
 *
 * @param {string}   label                   - Texto de la etiqueta visible.
 * @param {string}   textAreaId              - ID único del textarea (vincula label y textarea).
 * @param {string}   [placeholder]           - Texto de placeholder del textarea.
 * @param {string}   [description]           - Texto de ayuda opcional bajo el textarea.
 * @param {string}   [value]                 - Valor controlado del textarea.
 * @param {Function} [onChange]              - Callback al cambiar el valor: (e) => void.
 * @param {number}   [rows=4]                - Número de filas visibles del textarea.
 * @param {boolean}  [disabled=false]        - Deshabilita el textarea.
 * @param {boolean}  [required=false]        - Indica si el campo es obligatorio.
 * @param {string}   [className]             - Clases CSS adicionales para el Textarea.
 * @param {...any}   props                   - Props adicionales pasadas al componente Textarea.
 *
 * @example
 * <TextAreaForm
 *   label="Descripción"
 *   textAreaId="description"
 *   placeholder="Escribe una descripción detallada..."
 *   description="Máximo 500 caracteres."
 *   rows={6}
 *   value={data.description}
 *   onChange={(e) => setData('description', e.target.value)}
 * />
 */

import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

export default function TextAreaForm({
    label,
    textAreaId,
    placeholder,
    description,
    value,
    onChange,
    rows = 4,
    disabled = false,
    required = false,
    className,
    ...props
}) {
    return (
        <Field>
            <FieldLabel htmlFor={textAreaId}>
                {label}
            </FieldLabel>
            <Textarea
                id={textAreaId}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={rows}
                disabled={disabled}
                required={required}
                className={`resize-none${className ? ` ${className}` : ''}`}
                {...props}
            />
            {description && (
                <FieldDescription>{description}</FieldDescription>
            )}
        </Field>
    );
}
