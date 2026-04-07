import FileInputForm from '@/Components/Forms/FIleInputForm';
import FileForm from '@/Components/Forms/FIleInputForm';

export default function FileForm() {
    return (
        <FileInputForm
            name="file"
            label="Documento de identidad"
            accept=".pdf,.jpg,.jpeg,.png"
            helperText="Da clic aquí para buscar"
            buttonText="Seleccionar archivo"
            description="Sube tus documentos. Formatos permitidos: PDF, JPG, JPEG y PNG."
        />
    )
}
