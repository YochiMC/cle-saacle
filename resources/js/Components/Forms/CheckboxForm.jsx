/**
 * CheckboxForm
 *
 * Componente de checkbox para formularios. Renderiza un checkbox con su
 * etiqueta asociada dentro de un Field horizontal.
 *
 * @component
 *
 * @param {string}   label                       - Texto visible de la etiqueta del checkbox.
 * @param {string}   checkboxId                  - ID único del checkbox (vincula label con input).
 * @param {boolean}  [checked]                   - Valor controlado del checkbox.
 * @param {boolean}  [defaultChecked=false]       - Valor inicial cuando no se controla externamente.
 * @param {Function} [onCheckedChange]            - Callback al cambiar el estado: (checked) => void.
 * @param {boolean}  [disabled=false]             - Deshabilita el checkbox.
 * @param {string}   [description]               - Texto de ayuda opcional bajo el checkbox.
 * @param {...any}   props                        - Props adicionales pasadas al componente Checkbox.
 *
 * @example
 * <CheckboxForm
 *   label="Acepto los términos y condiciones"
 *   checkboxId="terms"
 *   checked={data.terms}
 *   onCheckedChange={(val) => setData('terms', val)}
 * />
 */

import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';

export default function CheckboxForm({
    label,
    checkboxId,
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    description,
    ...props
}) {
    return (
        <Field orientation="horizontal">
            <Checkbox
                id={checkboxId}
                checked={checked}
                defaultChecked={defaultChecked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                {...props}
            />
            <div>
                <FieldLabel
                    htmlFor={checkboxId}
                    className="font-normal"
                >
                    {label}
                </FieldLabel>
                {description && (
                    <FieldDescription>{description}</FieldDescription>
                )}
            </div>
        </Field>
    );
}
