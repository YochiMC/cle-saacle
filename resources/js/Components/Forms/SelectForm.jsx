/**
 * SelectForm
 *
 * Componente de lista desplegable (select) para formularios. Renderiza un Select
 * con su FieldLabel y las opciones mapeadas. Admite uso controlado y no controlado.
 *
 * @component
 *
 * @param {Array<{value: string, label: string}>} options    - Listado de opciones para el select.
 * @param {string}   label                                   - Texto de la etiqueta visible.
 * @param {string}   selectId                                - ID único del trigger del select.
 * @param {string}   [placeholder]                           - Texto mostrado cuando no hay selección.
 * @param {string}   [value]                                 - Valor controlado actualmente seleccionado.
 * @param {Function} [onValueChange]                         - Callback al cambiar la opción: (value) => void.
 * @param {string}   [defaultValue=""]                       - Valor inicial cuando no se controla externamente.
 * @param {boolean}  [disabled=false]                        - Deshabilita el select.
 * @param {string}   [description]                           - Texto de ayuda opcional bajo el select.
 * @param {...any}   props                                    - Props adicionales pasadas al componente Select.
 *
 * @example
 * <SelectForm
 *   label="Rol del usuario"
 *   selectId="role"
 *   placeholder="Selecciona un rol..."
 *   options={[
 *     { value: 'admin', label: 'Administrador' },
 *     { value: 'editor', label: 'Editor' },
 *   ]}
 *   value={data.role}
 *   onValueChange={(val) => setData('role', val)}
 * />
 */

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';

export default function SelectForm({
    options = [],
    label,
    selectId,
    placeholder,
    value,
    onValueChange,
    defaultValue = '',
    disabled = false,
    description,
    ...props
}) {
    return (
        <Field>
            <FieldLabel htmlFor={selectId}>
                {label}
            </FieldLabel>
            <Select
                value={value}
                onValueChange={onValueChange}
                defaultValue={defaultValue}
                disabled={disabled}
                {...props}
            >
                <SelectTrigger id={selectId}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {description && (
                <FieldDescription>{description}</FieldDescription>
            )}
        </Field>
    );
}
