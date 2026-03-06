/**
 * ButtonForm
 *
 * Componente de botones para formularios. Renderiza un botón de envío (submit)
 * y un botón de cancelar (outline) dentro de un Field horizontal.
 *
 * @component
 *
 * @param {string}   [submitLabel="Submit"]  - Texto del botón de envío.
 * @param {string}   [cancelLabel="Cancel"]  - Texto del botón de cancelar.
 * @param {Function} [onCancel]              - Callback que se ejecuta al presionar Cancelar.
 * @param {boolean}  [isLoading=false]       - Deshabilita ambos botones mientras se procesa.
 * @param {string}   [className]             - Clases CSS adicionales para el Field contenedor.
 *
 * @example
 * <ButtonForm
 *   submitLabel="Guardar"
 *   cancelLabel="Cancelar"
 *   onCancel={() => router.back()}
 *   isLoading={processing}
 * />
 */

import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';

export default function ButtonForm({
    submitLabel = 'Submit',
    cancelLabel = 'Cancel',
    onCancel,
    isLoading = false,
    className,
}) {
    return (
        <Field orientation="horizontal" className={className}>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Cargando...' : submitLabel}
            </Button>
            <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={onCancel}
            >
                {cancelLabel}
            </Button>
        </Field>
    );
}
