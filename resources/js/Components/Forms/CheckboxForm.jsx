import {Field, FieldLabel} from '@/components/ui/field';
import {Checkbox} from '@/components/ui/checkbox';

export default function CheckboxForm({label, checkboxId, ...props}) {
    return (
        <Field orientation="horizontal">
            <Checkbox
                id={checkboxId}
                defaultChecked
            />
            <FieldLabel
                htmlFor={checkboxId}
                className="font-normal"
            >
                {label}
            </FieldLabel>
        </Field>
    );
}