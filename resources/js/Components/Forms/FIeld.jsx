import {Input} from '@/Components/ui/Input';

export default function Field({label, name, type = 'text', ...props}) {
    return (
        <>
            <Input placeholder="Enter text" />
        </>
    );
}
