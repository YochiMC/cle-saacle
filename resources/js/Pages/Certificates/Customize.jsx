import { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import {
    CheckCircle,
    Edit2,
    ArrowLeft,
    Save,
    GraduationCap,
    Clock,
    FileText,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function CustomizeCertificate({ certificate, student }) {
    const [formData, setFormData] = useState({
        student_name: certificate.student_name,
        carrera: certificate.carrera,
        promedio: certificate.promedio,
        nivel: certificate.nivel,
        constancy_number:
            certificate.constancy_number ||
            String(certificate.id).padStart(3, "0"),
        pronombre: certificate.pronombre || "el",
        student_type: certificate.student_type || "egresado",
        signer_one_name:
            certificate.signer_one_name || "FÁTIMA DEL ROCÍO BECERRA LÓPEZ",
        signer_one_title:
            certificate.signer_one_title ||
            "COORDINADORA DE LENGUAS EXTRANJERAS",
        signer_two_name:
            certificate.signer_two_name || "ROCÍO SILVIA VARGAS MONTES DE OCA",
        signer_two_title:
            certificate.signer_two_title ||
            "SUBDIRECTORA DE PLANEACIÓN Y VINCULACIÓN",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [previewHtml, setPreviewHtml] = useState("");

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const csrfToken =
                    document.querySelector('meta[name="csrf-token"]')?.content ||
                    document.cookie
                        .split("; ")
                        .find((r) => r.startsWith("XSRF-TOKEN="))
                        ?.split("=")[1];

                const response = await fetch(
                    `/acreditaciones/customize/${certificate.id}/preview-live`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": csrfToken,
                        },
                        body: JSON.stringify(formData),
                    }
                );
                
                if (response.ok) {
                    const text = await response.text();
                    setPreviewHtml(text);
                }
            } catch (error) {
                console.error("Error al obtener vista previa", error);
            }
        };

        const timeoutId = setTimeout(fetchPreview, 500);
        return () => clearTimeout(timeoutId);
    }, [formData, certificate.id]);

    const pronounOptions = [
        {
            value: "el",
            label: "El",
            example: "Aparecerá en la carta como: el C.",
        },
        {
            value: "la",
            label: "La",
            example: "Aparecerá en la carta como: la C.",
        },
        {
            value: "elle",
            label: "Elle",
            example: "Aparecerá en la carta como: al C.",
        },
    ];

    const studentTypeOptions = [
        {
            value: "egresado",
            label: "Ya Egresado",
            icon: GraduationCap,
            description: "Vigencia de 2 años a partir de ser emitida",
            vigencia: "2 años a partir de ser emitida",
        },
        {
            value: "actual",
            label: "Alumno Actual",
            icon: Clock,
            description: "Vigencia de 2 años a partir de que se egresa",
            vigencia: "2 años a partir de que se egresa",
        },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleConfirm = async (format = 'pdf') => {
        setLoading(true);
        setErrors({});
        try {
            const csrfToken =
                document.querySelector('meta[name="csrf-token"]')?.content ||
                document.cookie
                    .split("; ")
                    .find((r) => r.startsWith("XSRF-TOKEN="))
                    ?.split("=")[1];

            const response = await fetch(
                `/acreditaciones/customize/${certificate.id}/confirm`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify(formData),
                },
            );

            let data;
            try {
                data = await response.json();
            } catch {
                setErrors({
                    general: `Error del servidor (${response.status}): ${response.statusText}`,
                });
                setLoading(false);
                return;
            }

            if (!response.ok) {
                // Si ya fue emitida, descargar directamente sin re-confirmar
                if (
                    response.status === 403 &&
                    data.error?.includes("ya emitida")
                ) {
                    window.location.href = `/acreditaciones/customize/${certificate.id}/download`;
                    return;
                }
                setErrors({
                    general:
                        data.error ||
                        data.message ||
                        `Error ${response.status} al confirmar la constancia.`,
                });
                setLoading(false);
                return;
            }

            if (data.success) {
                // Descargar via ruta del servidor (evita problemas de storage symlink)
                let downloadRoute = `/acreditaciones/customize/${certificate.id}/download`;
                let fileName = `Constancia_${certificate.num_control}.pdf`;

                if (format === 'word') {
                    downloadRoute = `/acreditaciones/customize/${certificate.id}/download-word`;
                    fileName = `Constancia_${certificate.num_control}.docx`;
                } else if (format === 'word-all') {
                    downloadRoute = `/acreditaciones/customize/${certificate.id}/download-word-all`;
                    fileName = `Constancias_Muestra_${certificate.num_control}.zip`;
                }

                const link = document.createElement("a");
                link.href = downloadRoute;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Redirigir después de 1.5 segundos
                setTimeout(() => {
                    window.location.href = "/acreditaciones";
                }, 1500);
            } else {
                setErrors({
                    general:
                        data.message || "No se pudo generar la constancia.",
                });
                setLoading(false);
            }
        } catch (error) {
            setErrors({ general: "Error de red: " + error.message });
            setLoading(false);
        }
    };

    const selectedStudentType = studentTypeOptions.find(
        (o) => o.value === formData.student_type,
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 w-full">
                    <h2 className="font-bold text-2xl text-gray-800 leading-tight flex items-center gap-2">
                        <Edit2 className="w-7 h-7 text-orangeTec" />
                        Personalizar Constancia
                    </h2>
                    <span
                        className={`w-fit px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            certificate.status === "confirmed"
                                ? "bg-blueTec/10 text-blueTec border-blueTec/20"
                                : certificate.status === "issued"
                                  ? "bg-orangeTec/10 text-orangeTec border-orangeTec/20"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                    >
                        {certificate.status === "confirmed"
                            ? "Confirmado"
                            : certificate.status === "issued"
                              ? "Emitido"
                              : "Borrador"}
                    </span>
                </div>
            }
        >
            <Head title="Personalizar Constancia — CLE ITL" />

            {/* Custom font and specific styling only for the Certificate Preview Card */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap');
                .font-playfair {
                    font-family: 'Playfair Display', serif;
                }
            `}</style>

            <div className="py-8 bg-gray-50/50 min-h-[calc(100vh-12rem)] rounded-3xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* FORMULARIO */}
                        <div className="bg-white p-6 shadow-md border border-blueTec/20 sm:rounded-3xl sm:p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                                Editar Información
                            </h3>

                            {errors.general && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                                    {errors.general}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        Nombre del Estudiante
                                    </label>
                                    <input
                                        type="text"
                                        name="student_name"
                                        value={formData.student_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blueTec focus:ring-1 focus:ring-blueTec transition-all ${
                                            errors.student_name
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }`}
                                        placeholder="Nombre completo del estudiante"
                                    />
                                    {errors.student_name && (
                                        <div className="text-xs text-red-500 mt-1.5 font-medium">
                                            {errors.student_name}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        Carrera
                                    </label>
                                    <input
                                        type="text"
                                        name="carrera"
                                        value={formData.carrera}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blueTec focus:ring-1 focus:ring-blueTec transition-all ${
                                            errors.carrera
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }`}
                                        placeholder="Nombre de la carrera"
                                    />
                                    {errors.carrera && (
                                        <div className="text-xs text-red-500 mt-1.5 font-medium">
                                            {errors.carrera}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                            Puntaje / Calificación
                                        </label>
                                        <input
                                            type="number"
                                            name="promedio"
                                            value={formData.promedio}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blueTec focus:ring-1 focus:ring-blueTec transition-all ${
                                                errors.promedio
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                    : ""
                                            }`}
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                        {errors.promedio && (
                                            <div className="text-xs text-red-500 mt-1.5 font-medium">
                                                {errors.promedio}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                            Nivel MCER (si aplica)
                                        </label>
                                        <input
                                            type="text"
                                            name="nivel"
                                            value={formData.nivel}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blueTec focus:ring-1 focus:ring-blueTec transition-all"
                                            placeholder="A1, A2, B1, B2, C1, C2"
                                        />
                                    </div>
                                </div>

                                {/* ── NÚMERO DE CONSTANCIA ── */}
                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                            Número de Constancia
                                        </label>
                                        <input
                                            type="text"
                                            name="constancy_number"
                                            value={formData.constancy_number}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blueTec focus:ring-1 focus:ring-blueTec transition-all"
                                            placeholder="001"
                                            maxLength="10"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange({ target: { name: "constancy_number", value: "000" } })}
                                        className="px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase rounded-xl hover:bg-amber-100 transition-all"
                                        title="Resetear número de constancia a 000"
                                    >
                                        Reset
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                                        Pronombre
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {pronounOptions.map((option) => (
                                            <div
                                                key={option.value}
                                                className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition-all duration-200 hover:border-blueTec ${
                                                    formData.pronombre ===
                                                    option.value
                                                        ? "border-2 border-blueTec bg-blueTec/5"
                                                        : "border-gray-200"
                                                }`}
                                                onClick={() =>
                                                    handleInputChange({
                                                        target: {
                                                            name: "pronombre",
                                                            value: option.value,
                                                        },
                                                    })
                                                }
                                            >
                                                <div className="font-bold text-gray-900 text-sm">
                                                    {option.label}
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-1 text-center">
                                                    {option.example}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ── VIGENCIA / TIPO DE ESTUDIANTE ── */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                                        Vigencia de la Constancia
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {studentTypeOptions.map((option) => {
                                            const Icon = option.icon;
                                            const selected =
                                                formData.student_type ===
                                                option.value;
                                            return (
                                                <div
                                                    key={option.value}
                                                    className={`flex flex-col gap-2 p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                                                        selected
                                                            ? "border-2 border-orangeTec bg-orangeTec/5"
                                                            : "border-gray-200 hover:border-orangeTec/50"
                                                    }`}
                                                    onClick={() =>
                                                        handleInputChange({
                                                            target: {
                                                                name: "student_type",
                                                                value: option.value,
                                                            },
                                                        })
                                                    }
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Icon
                                                            size={16}
                                                            className={
                                                                selected
                                                                    ? "text-orangeTec"
                                                                    : "text-gray-400"
                                                            }
                                                        />
                                                        <span
                                                            className={`font-bold text-sm ${selected ? "text-orangeTec" : "text-gray-700"}`}
                                                        >
                                                            {option.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 leading-relaxed">
                                                        {option.description}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Preview del texto de vigencia */}
                                    <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                                        <p className="text-xs text-gray-500 font-medium mb-1">
                                            Texto en la constancia:
                                        </p>
                                        <p className="text-xs text-gray-700 italic">
                                            "La presente constancia tendrá una
                                            vigencia de{" "}
                                            <strong>
                                                {selectedStudentType?.vigencia}
                                            </strong>
                                            ."
                                        </p>
                                    </div>
                                </div>

                                <hr className="my-6 border-gray-200" />

                                <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
                                    Información de Firmas
                                </h4>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        Nombre del Firmante 1
                                    </label>
                                    <input
                                        type="text"
                                        name="signer_one_name"
                                        value={formData.signer_one_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blueTec focus:ring-1 focus:ring-blueTec transition-all ${
                                            errors.signer_one_name
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }`}
                                        placeholder="Nombre completo"
                                    />
                                    {errors.signer_one_name && (
                                        <div className="text-xs text-red-500 mt-1.5 font-medium">
                                            {errors.signer_one_name}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        Cargo del Firmante 1
                                    </label>
                                    <input
                                        type="text"
                                        name="signer_one_title"
                                        value={formData.signer_one_title}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blueTec focus:ring-1 focus:ring-blueTec transition-all ${
                                            errors.signer_one_title
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }`}
                                        placeholder="Cargo o puesto"
                                    />
                                    {errors.signer_one_title && (
                                        <div className="text-xs text-red-500 mt-1.5 font-medium">
                                            {errors.signer_one_title}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        Nombre del Firmante 2
                                    </label>
                                    <input
                                        type="text"
                                        name="signer_two_name"
                                        value={formData.signer_two_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blueTec focus:ring-1 focus:ring-blueTec transition-all ${
                                            errors.signer_two_name
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }`}
                                        placeholder="Nombre completo"
                                    />
                                    {errors.signer_two_name && (
                                        <div className="text-xs text-red-500 mt-1.5 font-medium">
                                            {errors.signer_two_name}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        Cargo del Firmante 2
                                    </label>
                                    <input
                                        type="text"
                                        name="signer_two_title"
                                        value={formData.signer_two_title}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blueTec focus:ring-1 focus:ring-blueTec transition-all ${
                                            errors.signer_two_title
                                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }`}
                                        placeholder="Cargo o puesto"
                                    />
                                    {errors.signer_two_title && (
                                        <div className="text-xs text-red-500 mt-1.5 font-medium">
                                            {errors.signer_two_title}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* end space-y-6 */}

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                                <a
                                    href="/acreditaciones"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Cancelar
                                </a>
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleConfirm('pdf')}
                                        disabled={loading}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blueTec hover:bg-blueTec/90 active:bg-blueTec/95 transition-all shadow-md shadow-blueTec/10 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <Save size={16} />
                                        {loading ? "Guardando..." : "Descargar PDF"}
                                    </button>
                                    <button
                                        onClick={() => handleConfirm('word')}
                                        disabled={loading}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md shadow-indigo-600/10 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <FileText size={16} />
                                        {loading ? "Guardando..." : "Descargar Word"}
                                    </button>
                                    <button
                                        onClick={() => handleConfirm('word-all')}
                                        disabled={loading}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        title="Descarga un archivo ZIP con los 4 tipos de constancias en Word para probar los textos"
                                    >
                                        <FileText size={16} />
                                        Descargar las 4 en Word (ZIP)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* PREVIEW */}
                        <div className="lg:sticky lg:top-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                                Vista Previa del Documento
                            </h3>
                            <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-blueTec/10 h-[800px] relative">
                                {previewHtml ? (
                                    <iframe 
                                        srcDoc={previewHtml}
                                        className="w-full h-full border-0"
                                        title="Vista Previa Constancia"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                        <div className="text-gray-400 font-medium animate-pulse">Cargando vista previa...</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
