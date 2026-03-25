/**
 * CheckboxForm
 *
 * Componente reutilizable para campos booleanos en formularios.
 * Renderiza un checkbox con etiqueta y descripción opcional, con soporte
 * de tematización por tono (default, institutional, warning).
 *
 * @component
 *
 * @param {string} label - Texto visible de la etiqueta del checkbox.
 * @param {string} checkboxId - ID único del checkbox (vincula label con input).
 * @param {boolean} [checked] - Valor controlado del checkbox.
 * @param {boolean} [defaultChecked=false] - Valor inicial cuando no se controla externamente.
 * @param {(checked: boolean | "indeterminate") => void} [onCheckedChange] - Callback al cambiar el estado.
 * @param {boolean} [disabled=false] - Deshabilita el checkbox.
 * @param {string} [description] - Texto de ayuda opcional bajo el checkbox.
 * @param {"default"|"institutional"|"warning"} [tone="default"] - Define la paleta visual aplicada al checkbox y textos.
 * @param {string} [fieldClassName=""] - Clases CSS adicionales para el contenedor Field.
 * @param {string} [checkboxClassName=""] - Clases CSS adicionales para el checkbox.
 * @param {string} [labelClassName=""] - Clases CSS adicionales para la etiqueta.
 * @param {string} [descriptionClassName=""] - Clases CSS adicionales para la descripción.
 * @param {...any} props - Props adicionales pasadas al componente base Checkbox.
 *
 * @example
 * <CheckboxForm
 *   label="Acepto los términos y condiciones"
 *   checkboxId="terms"
 *   checked={data.terms}
 *   onCheckedChange={(val) => setData('terms', val)}
 * />
 */

import { Field, FieldLabel, FieldDescription } from '@/Components/ui/field';
import { Checkbox } from '@/Components/ui/checkbox';

export default function CheckboxForm({
    label,
    checkboxId,
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    description,
    tone = 'default',
    fieldClassName = '',
    checkboxClassName = '',
    labelClassName = '',
    descriptionClassName = '',
    ...props
}) {
    const toneClasses = {
        default: {
            checkbox: '',
            label: '',
            description: '',
        },
        institutional: {
            checkbox: 'border-blueTec data-[state=checked]:bg-blueTec data-[state=checked]:text-white focus-visible:ring-blueTec/40',
            label: 'text-blueTec',
            description: 'text-blueTec/80',
        },
        warning: {
            checkbox: 'border-orangeTec data-[state=checked]:bg-orangeTec data-[state=checked]:text-white focus-visible:ring-orangeTec/40',
            label: 'text-orangeTec',
            description: 'text-orangeTec/80',
        },
    };

    const currentTone = toneClasses[tone] ?? toneClasses.default;

    return (
        <Field orientation="horizontal" className={fieldClassName}>
            <Checkbox
                id={checkboxId}
                checked={checked}
                defaultChecked={defaultChecked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                className={`${currentTone.checkbox} ${checkboxClassName}`.trim()}
                {...props}
            />
            <div>
                <FieldLabel
                    htmlFor={checkboxId}
                    className={`font-normal ${currentTone.label} ${labelClassName}`.trim()}
                >
                    {label}
                </FieldLabel>
                {description && (
                    <FieldDescription className={`${currentTone.description} ${descriptionClassName}`.trim()}>{description}</FieldDescription>
                )}
            </div>
        </Field>
    );
}
