/**
 * InputForm
 *
 * Componente de campo de texto para formularios. Renderiza un Input con su
 * FieldLabel y una FieldDescription opcional. Admite uso controlado y no controlado.
 *
 * @component
 *
 * @param {string}   label                   - Texto de la etiqueta visible.
 * @param {string}   inputId                 - ID único del input (vincula label y input).
 * @param {string}   [placeholder]           - Texto de placeholder del input.
 * @param {string}   [description]           - Texto de ayuda opcional bajo el input.
 * @param {string}   [type="text"]           - Tipo de input HTML (text, email, password, number, etc.).
 * @param {string}   [value]                 - Valor controlado del input.
 * @param {Function} [onChange]              - Callback al cambiar el valor: (e) => void.
 * @param {boolean}  [required=true]         - Indica si el campo es obligatorio.
 * @param {boolean}  [disabled=false]        - Deshabilita el input.
 * @param {string}   [className]             - Clases CSS adicionales para el Input.
 * @param {...any}   props                   - Props adicionales pasadas al componente Input.
 *
 * @example
 * <InputForm
 *   label="Correo electrónico"
 *   inputId="email"
 *   type="email"
 *   placeholder="usuario@ejemplo.com"
 *   description="Usaremos este correo para enviarte notificaciones."
 *   value={data.email}
 *   onChange={(e) => setData('email', e.target.value)}
 * />
 */

import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { forwardRef } from 'react';

const InputForm = forwardRef(function InputForm({
    label,
    inputId,
    placeholder,
    description,
    type = 'text',
    value,
    onChange,
    required = true,
    disabled = false,
    className,
    ...props
}, ref) {
    return (
        <Field>
            <FieldLabel htmlFor={inputId}>
                {label}
            </FieldLabel>
            <Input
                ref={ref}
                id={inputId}
                type={type}
                placeholder={placeholder}
                value={value ?? ''}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={className}
                {...props}
            />
            {description && (
                <FieldDescription>{description}</FieldDescription>
            )}
        </Field>
    );
});

export default InputForm;
