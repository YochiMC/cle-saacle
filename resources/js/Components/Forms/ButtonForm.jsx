import {Field} from '@/components/ui/field';
import {Button} from '@/components/ui/button'

export default function ButtonForm({ }) {
    return (
        <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">
                Cancel
            </Button>
        </Field>
    );
}