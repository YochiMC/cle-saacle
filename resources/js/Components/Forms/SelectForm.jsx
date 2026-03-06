import { SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectContent, Select } from "@/components/ui/select";
import { Field, FieldLabel } from '@/components/ui/field';

export default function SelectForm({ options, label, placeholder, selectId, ...props }) {
    return (
        <Field>
            <FieldLabel htmlFor={selectId}>
                {label}
            </FieldLabel>
            <Select defaultValue="">
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
        </Field>
    );
}
