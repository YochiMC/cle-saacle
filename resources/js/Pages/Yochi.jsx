import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from '@/Components/ui/field';
import TextAreaForm from '@/components/Forms/TextAreaForm';
import SelectForm from "@/components/Forms/SelectForm";
import InputForm from '@/components/Forms/InputForm';
import CheckboxForm from '@/components/Forms/CheckboxForm';
import ButtonForm from '@/components/Forms/ButtonForm';
import SessionLayout from '@/Layouts/SessionLayout';

export default function Yochi() {

    const months = [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
        { value: "6", label: "6" },
        { value: "7", label: "7" },
        { value: "8", label: "8" },
        { value: "9", label: "9" },
        { value: "10", label: "10" },
        { value: "11", label: "11" },
        { value: "12", label: "12" },
    ]

    const years = [
        { value: "2024", label: "2024" },
        { value: "2025", label: "2025" },
        { value: "2026", label: "2026" },
        { value: "2027", label: "2027" },
        { value: "2028", label: "2028" },
        { value: "2029", label: "2029" },
    ]

    return (
        <SessionLayout
            header={
                <h2 className="text-3xl font-bold text-foreground">
                    Método de Pago
                </h2>
            }
        >
            <div className="w-full max-w-md">
                <form>
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend>Payment Method</FieldLegend>
                            <FieldDescription>
                                All transactions are secure and encrypted
                            </FieldDescription>
                            <FieldGroup>
                                <InputForm label="Name on Card" placeholder="Evil Rabbit" inputId="checkout-7j9-card-name-43j"/>
                                <InputForm label="Card Number" placeholder="1234 5678 9012 3456" inputId="checkout-7j9-card-number-uw1" description="Enter your 16-digit card number"/>
                                <div className="grid grid-cols-3 gap-4">
                                    <SelectForm options={months} label="Month" placeholder="MM" selectId="checkout-exp-month-ts6" />
                                    <SelectForm options={years} label="Year" placeholder="YYYY" selectId="checkout-exp-year-ts6" />
                                </div>
                            </FieldGroup>
                        </FieldSet>
                        <FieldSeparator />
                        <FieldSet>
                            <FieldLegend>Billing Address</FieldLegend>
                            <FieldDescription>
                                The billing address associated with your payment method
                            </FieldDescription>
                            <FieldGroup>
                                <CheckboxForm label="Same as shipping address" checkboxId="checkout-7j9-same-as-shipping-wgm" />
                            </FieldGroup>
                        </FieldSet>
                        <FieldSet>
                            <FieldGroup>
                                <TextAreaForm label="Comments" placeholder="Add any additional comments" textAreaId="checkout-7j9-optional-comments" />
                            </FieldGroup>
                        </FieldSet>
                        <ButtonForm />
                    </FieldGroup>
                </form>
            </div>
        </SessionLayout>
    )
}
