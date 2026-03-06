import {Field, FieldLabel} from '@/components/ui/field';
import {Textarea} from '@/components/ui/textarea';

export default function TextAreaForm({label, placeholder, textAreaId}) {
    return (
        <Field>
            <FieldLabel htmlFor={textAreaId}>
                {label}
            </FieldLabel>
            <Textarea
                id={textAreaId}
                placeholder={placeholder}
                className="resize-none"
            />
        </Field>
    );
}