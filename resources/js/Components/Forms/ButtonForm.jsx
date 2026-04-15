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
 * @param {boolean}  [submitDisabled=false]  - Deshabilita solo el botón de envío.
 * @param {boolean}  [cancelDisabled=false]  - Deshabilita solo el botón de cancelar.
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
    disabled = false,
    submitDisabled = false,
    cancelDisabled = false,
    tone = 'default',
    submitVariant = 'default',
    cancelVariant = 'outline',
    submitClassName = '',
    cancelClassName = '',
    showCancel = true,
    className,
}) {
    const isSubmitBusy = isLoading || disabled || submitDisabled;
    const isCancelBusy = isLoading || disabled || cancelDisabled;

    const toneClasses = {
        default: {
            submit: '',
            cancel: '',
        },
        institutional: {
            submit: 'bg-blueTec text-white hover:bg-blueTec/90',
            cancel: 'border-blueTec/30 text-blueTec hover:bg-blueTec/10',
        },
        warning: {
            submit: 'bg-orangeTec text-white hover:bg-orangeTec/90',
            cancel: 'border-orangeTec/30 text-orangeTec hover:bg-orangeTec/10',
        },
    };

    const currentTone = toneClasses[tone] ?? toneClasses.default;

    return (
        <Field orientation="horizontal" className={className}>
            <Button
                type="submit"
                variant={submitVariant}
                disabled={isSubmitBusy}
                className={`${currentTone.submit} ${submitClassName}`.trim()}
            >
                {submitLabel}
            </Button>
            {showCancel && (
                <Button
                    variant={cancelVariant}
                    type="button"
                    disabled={isCancelBusy}
                    onClick={onCancel}
                    className={`${currentTone.cancel} ${cancelClassName}`.trim()}
                >
                    {cancelLabel}
                </Button>
            )}
        </Field>
    );
}
