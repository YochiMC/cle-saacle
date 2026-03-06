import {Field, FieldLabel, FieldDescription} from '@/components/ui/field';
import {Input} from '@/components/ui/input';

export default function InputForm({ label, placeholder, inputId, description, ...props }) {
    return (
        <Field>
            <FieldLabel htmlFor={inputId}>
                {label}
            </FieldLabel>
            <Input
                id={inputId}
                placeholder={placeholder}
                required
            />
            {description && (
                <FieldDescription>{description}</FieldDescription>
            )}
        </Field>
    );
}