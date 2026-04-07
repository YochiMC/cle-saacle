import { useMemo, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Field, FieldLabel, FieldDescription } from '@/Components/ui/field';
import { Input } from '@/Components/ui/input';

/**
 * FileInputForm
 *
 * Campo de carga de archivos con estilo consistente para el proyecto.
 * Incluye zona de drag & drop, botón para explorador y resumen del archivo
 * seleccionado. Está pensado para documentos de identidad (INE, RFC, CURP, etc.).
 *
 * @param {Object} props
 * @param {string} props.name Identificador del input y nombre del campo.
 * @param {string} props.label Texto visible de la etiqueta.
 * @param {Function} props.onChange Callback que recibe el evento de cambio.
 * @param {string} [props.accept='.pdf,.jpg,.jpeg,.png'] Tipos de archivo permitidos.
 * @param {boolean} [props.multiple=false] Habilita selección múltiple.
 * @param {boolean} [props.required=false] Indica si el campo es obligatorio.
 * @param {boolean} [props.disabled=false] Deshabilita el campo cuando es true.
 * @param {string} [props.helperText] Texto secundario mostrado en el dropzone.
 * @param {string} [props.buttonText='Browse files'] Texto del botón de exploración.
 * @param {string} [props.description] Texto de ayuda bajo el input.
 * @param {string} [props.className] Clases adicionales para el contenedor del dropzone.
 */
export default function FileInputForm({
    name,
    label,
    onChange,
    accept = '.pdf,.jpg,.jpeg,.png',
    multiple = false,
    required = false,
    disabled = false,
    helperText = 'Or click to browse files',
    buttonText = 'Browse files',
    description = 'Selecciona un archivo para subir. Formatos permitidos: PDF, JPG, JPEG y PNG. Tamaño máximo sugerido: 10MB.',
    className = '',
}) {
    const describedById = `${name}-description`;
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const emitChange = (files, nativeEvent = null) => {
        if (!onChange) {
            return;
        }

        onChange({
            target: { name, files },
            currentTarget: { name, files },
            nativeEvent,
        });
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(files);

        if (onChange) {
            onChange(event);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        if (disabled) {
            return;
        }

        const droppedFiles = Array.from(event.dataTransfer.files || []);
        const normalizedFiles = multiple ? droppedFiles : droppedFiles.slice(0, 1);
        setSelectedFiles(normalizedFiles);

        // Sincroniza el input nativo para mantener compatibilidad con formularios.
        if (inputRef.current) {
            const dataTransfer = new DataTransfer();
            normalizedFiles.forEach((file) => dataTransfer.items.add(file));
            inputRef.current.files = dataTransfer.files;
        }

        emitChange(normalizedFiles, event.nativeEvent ?? null);
    };

    const openFileBrowser = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const descriptionText = useMemo(() => description, [description]);
    const selectedSummary = useMemo(() => {
        if (selectedFiles.length === 0) {
            return null;
        }

        if (selectedFiles.length === 1) {
            return `Archivo seleccionado: ${selectedFiles[0].name}`;
        }

        return `${selectedFiles.length} archivos seleccionados`;
    }, [selectedFiles]);

    return (
        <Field className="space-y-2">
            <FieldLabel htmlFor={name} className="text-slate-700">
                {label}
            </FieldLabel>

            <div
                className={`relative rounded-xl border-2 border-dashed bg-slate-50/55 p-6 transition-all duration-200 ${
                    isDragging
                        ? 'border-[#17365D] bg-[#17365D]/5 shadow-[0_0_0_3px_rgba(23,54,93,0.12)]'
                        : 'border-slate-300 hover:border-[#17365D]/45 hover:bg-white'
                } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${className}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileBrowser}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openFileBrowser();
                    }
                }}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                aria-describedby={describedById}
            >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-[#17365D]/85 shadow-sm">
                    <Upload className="h-5 w-5" aria-hidden="true" />
                </div>

                <Input
                    ref={inputRef}
                    id={name}
                    name={name}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    required={required}
                    disabled={disabled}
                    aria-describedby={describedById}
                    onChange={handleFileChange}
                    className="sr-only"
                />

                <p className="text-center text-base font-semibold text-slate-800">
                    Drag & drop files here
                </p>
                <p className="mt-1 text-center text-sm text-slate-500">
                    {helperText}
                </p>

                <div className="mt-4 flex justify-center">
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            openFileBrowser();
                        }}
                        disabled={disabled}
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17365D]/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {buttonText}
                    </button>
                </div>

                {selectedSummary && (
                    <p className="mt-3 text-center text-xs font-medium text-[#17365D]">
                        {selectedSummary}
                    </p>
                )}
            </div>

            <FieldDescription id={describedById} className="text-xs text-slate-500">
                {descriptionText}
            </FieldDescription>
        </Field>
    );
}
