import { Head } from "@inertiajs/react";
import Graficas from "@/Components/Charts/Graphics";
import { useState } from "react";
import ModalAlert from "@/Components/ui/ModalAlert";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

/**
 * Valores de los enums del backend (GroupType, ExamType).
 * Se usan como etiquetas en el eje X de las gráficas.
 */
const GROUP_TYPE_VALUES = [
    "Regular",
    "Intensivo",
    "Semi intensivo",
    "Programa Especial",
];
const EXAM_TYPE_VALUES = [
    "Convalidación",
    "Planes anteriores",
    "4 habilidades",
    "Ubicación",
];

/** Helpers para normalizar valores de enum que pueden llegar como objeto o string */
const resolveEnum = (val) =>
    typeof val === "object" && val !== null ? (val.value ?? val) : val;

export default function Reports({
    degrees = [],
    students = [],
    levels = [],
    periods = [],
    certificates = [],
    groups = [],
    exams = [],
    logos = {},
}) {
    const [openModal, setOpenModal] = useState(false);
    const [pageTitle, setPageTitle] = useState("Reporte de Estadísticas");

    const [charts, setCharts] = useState([
        {
            id: 1,
            type: "estatus",
            filterType: "todos",
            filterPeriod: "",
            filterCourseType: "todos",
            filterSpecificType: "",
            filterEntity: "",
            customTitle: "",
            description: "",
        },
        {
            id: 2,
            type: "tasa_aprobacion",
            filterType: "todos",
            filterPeriod: "",
            filterCourseType: "todos",
            filterSpecificType: "",
            filterEntity: "",
            customTitle: "",
            description: "",
        },
    ]);

    // ─── Acciones de gestión de gráficas ───
    const handlePrint = () => window.print();

    const addChart = () => {
        setCharts((prev) => [
            ...prev,
            {
                id: Date.now(),
                type: "estatus",
                filterType: "todos",
                filterPeriod: "",
                filterCourseType: "todos",
                filterSpecificType: "",
                filterEntity: "",
                customTitle: "",
                description: "",
            },
        ]);
    };

    const removeChart = (id) =>
        setCharts((prev) => prev.filter((c) => c.id !== id));

    const updateChart = (id, key, value) => {
        setCharts((prev) =>
            prev.map((c) => {
                if (c.id !== id) return c;
                const updated = { ...c, [key]: value };
                // Resetear filtros dependientes al cambiar su padre
                if (key === "filterCourseType") {
                    updated.filterSpecificType = "";
                    updated.filterEntity = "";
                }
                if (key === "filterPeriod") {
                    updated.filterEntity = "";
                }
                return updated;
            }),
        );
    };

    // ─── Opciones dinámicas para "Tipo Específico" según la fuente seleccionada ───
    const getSpecificTypeOptions = (courseType) => {
        const opts = [];
        if (courseType === "todos" || courseType === "curso") {
            GROUP_TYPE_VALUES.forEach((v) =>
                opts.push({ value: v, label: `Curso ${v}` }),
            );
        }
        if (courseType === "todos" || courseType === "examen") {
            EXAM_TYPE_VALUES.forEach((v) =>
                opts.push({ value: v, label: `Examen ${v}` }),
            );
        }
        return opts;
    };

    // ─── Opciones dinámicas para Grupo/Examen específico (filtrado por periodo y tipo) ───
    const getAvailableEntities = (config) => {
        const available = [];

        if (config.filterCourseType !== "examen") {
            groups
                .filter(
                    (g) =>
                        !config.filterPeriod ||
                        String(g.period_id) === String(config.filterPeriod),
                )
                .filter(
                    (g) =>
                        !config.filterSpecificType ||
                        resolveEnum(g.type) === config.filterSpecificType,
                )
                .forEach((g) =>
                    available.push({
                        value: `g_${g.id}`,
                        label: `(Grupo) ${g.name}`,
                    }),
                );
        }

        if (config.filterCourseType !== "curso") {
            exams
                .filter(
                    (e) =>
                        !config.filterPeriod ||
                        String(e.period_id) === String(config.filterPeriod),
                )
                .filter(
                    (e) =>
                        !config.filterSpecificType ||
                        resolveEnum(e.exam_type) === config.filterSpecificType,
                )
                .forEach((e) =>
                    available.push({
                        value: `e_${e.id}`,
                        label: `(Examen) ${e.name}`,
                    }),
                );
        }

        return available;
    };

    // ═══════════════════════════════════════════════════════════════
    //  MOTOR DE DATOS: filtra alumnos y calcula la métrica
    // ═══════════════════════════════════════════════════════════════
    const getChartData = (cfg) => {
        // ── 1. Filtro de población ──
        let filtered = [...students];

        if (cfg.filterType === "vigentes") {
            filtered = filtered.filter(
                (s) => resolveEnum(s.type_student) === "vigente",
            );
        } else if (cfg.filterType === "egresados") {
            filtered = filtered.filter(
                (s) => resolveEnum(s.type_student) === "egresado",
            );
        }

        // ── 2. Filtro de periodo ──
        if (cfg.filterPeriod) {
            filtered = filtered.filter(
                (s) =>
                    s.period_ids &&
                    s.period_ids.some(
                        (id) => String(id) === String(cfg.filterPeriod),
                    ),
            );
        }

        // ── 3. Filtro de fuente (curso / examen) ──
        if (cfg.filterCourseType === "curso") {
            if (cfg.filterPeriod) {
                filtered = filtered.filter(
                    (s) =>
                        s.course_period_ids &&
                        s.course_period_ids.some(
                            (id) => String(id) === String(cfg.filterPeriod),
                        ),
                );
            } else {
                filtered = filtered.filter(
                    (s) =>
                        s.course_period_ids && s.course_period_ids.length > 0,
                );
            }
        } else if (cfg.filterCourseType === "examen") {
            if (cfg.filterPeriod) {
                filtered = filtered.filter(
                    (s) =>
                        s.exam_period_ids &&
                        s.exam_period_ids.some(
                            (id) => String(id) === String(cfg.filterPeriod),
                        ),
                );
            } else {
                filtered = filtered.filter(
                    (s) => s.exam_period_ids && s.exam_period_ids.length > 0,
                );
            }
        }

        // ── 4. Filtro de tipo específico (ej. "Regular", "Convalidación") ──
        if (cfg.filterSpecificType) {
            const isGroupType = GROUP_TYPE_VALUES.includes(
                cfg.filterSpecificType,
            );
            const isExamType = EXAM_TYPE_VALUES.includes(
                cfg.filterSpecificType,
            );

            if (isGroupType) {
                const matchIds = new Set();
                groups
                    .filter(
                        (g) => resolveEnum(g.type) === cfg.filterSpecificType,
                    )
                    .filter(
                        (g) =>
                            !cfg.filterPeriod ||
                            String(g.period_id) === String(cfg.filterPeriod),
                    )
                    .forEach((g) =>
                        (g.qualifications || []).forEach((q) =>
                            matchIds.add(q.student_id),
                        ),
                    );
                filtered = filtered.filter((s) => matchIds.has(s.id));
            } else if (isExamType) {
                const matchIds = new Set();
                exams
                    .filter(
                        (e) =>
                            resolveEnum(e.exam_type) === cfg.filterSpecificType,
                    )
                    .filter(
                        (e) =>
                            !cfg.filterPeriod ||
                            String(e.period_id) === String(cfg.filterPeriod),
                    )
                    .forEach((e) =>
                        (e.students || []).forEach((s) => matchIds.add(s.id)),
                    );
                filtered = filtered.filter((s) => matchIds.has(s.id));
            }
        }

        const validIds = new Set(filtered.map((s) => s.id));

        // ── 5. Calcular la métrica ──
        switch (cfg.type) {
            // ────────── ESTATUS DEL ALUMNO ──────────
            case "estatus": {
                const counts = {};
                filtered.forEach((s) => {
                    const label = s.status_label || "Desconocido";
                    counts[label] = (counts[label] || 0) + 1;
                });
                return Object.entries(counts)
                    .map(([name, total]) => ({ name, total }))
                    .sort((a, b) => b.total - a.total);
            }

            // ────────── TASA DE APROBACIÓN ──────────
            case "tasa_aprobacion": {
                let aprobados = 0;
                let reprobados = 0;

                if (cfg.filterEntity?.startsWith("g_")) {
                    const group = groups.find(
                        (g) =>
                            String(g.id) === cfg.filterEntity.replace("g_", ""),
                    );
                    (group?.qualifications || []).forEach((q) => {
                        if (validIds.has(q.student_id)) {
                            parseFloat(q.final_average) >= 70
                                ? aprobados++
                                : reprobados++;
                        }
                    });
                } else if (cfg.filterEntity?.startsWith("e_")) {
                    const exam = exams.find(
                        (e) =>
                            String(e.id) === cfg.filterEntity.replace("e_", ""),
                    );
                    (exam?.students || []).forEach((s) => {
                        if (validIds.has(s.id) && s.pivot) {
                            parseFloat(
                                s.pivot.final_average ||
                                    s.pivot.calificacion ||
                                    0,
                            ) >= 70
                                ? aprobados++
                                : reprobados++;
                        }
                    });
                } else {
                    // Global: iterar grupos y exámenes que pasen los filtros
                    if (cfg.filterCourseType !== "examen") {
                        groups
                            .filter(
                                (g) =>
                                    !cfg.filterPeriod ||
                                    String(g.period_id) ===
                                        String(cfg.filterPeriod),
                            )
                            .filter(
                                (g) =>
                                    !cfg.filterSpecificType ||
                                    resolveEnum(g.type) ===
                                        cfg.filterSpecificType,
                            )
                            .forEach((g) =>
                                (g.qualifications || []).forEach((q) => {
                                    if (validIds.has(q.student_id)) {
                                        parseFloat(q.final_average) >= 70
                                            ? aprobados++
                                            : reprobados++;
                                    }
                                }),
                            );
                    }
                    if (cfg.filterCourseType !== "curso") {
                        exams
                            .filter(
                                (e) =>
                                    !cfg.filterPeriod ||
                                    String(e.period_id) ===
                                        String(cfg.filterPeriod),
                            )
                            .filter(
                                (e) =>
                                    !cfg.filterSpecificType ||
                                    resolveEnum(e.exam_type) ===
                                        cfg.filterSpecificType,
                            )
                            .forEach((e) =>
                                (e.students || []).forEach((s) => {
                                    if (validIds.has(s.id) && s.pivot) {
                                        parseFloat(
                                            s.pivot.final_average ||
                                                s.pivot.calificacion ||
                                                0,
                                        ) >= 70
                                            ? aprobados++
                                            : reprobados++;
                                    }
                                }),
                            );
                    }
                }

                return [
                    { name: "Aprobados", total: aprobados },
                    { name: "Reprobados", total: reprobados },
                ];
            }

            // ────────── POR TIPO DE CURSO (enum GroupType en eje X) ──────────
            case "tipo_curso": {
                return GROUP_TYPE_VALUES.map((tipo) => {
                    const studentIds = new Set();
                    groups
                        .filter((g) => resolveEnum(g.type) === tipo)
                        .filter(
                            (g) =>
                                !cfg.filterPeriod ||
                                String(g.period_id) ===
                                    String(cfg.filterPeriod),
                        )
                        .forEach((g) =>
                            (g.qualifications || []).forEach((q) => {
                                if (validIds.has(q.student_id))
                                    studentIds.add(q.student_id);
                            }),
                        );
                    return { name: tipo, total: studentIds.size };
                });
            }

            // ────────── POR TIPO DE EXAMEN (enum ExamType en eje X) ──────────
            case "tipo_examen": {
                return EXAM_TYPE_VALUES.map((tipo) => {
                    const studentIds = new Set();
                    exams
                        .filter((e) => resolveEnum(e.exam_type) === tipo)
                        .filter(
                            (e) =>
                                !cfg.filterPeriod ||
                                String(e.period_id) ===
                                    String(cfg.filterPeriod),
                        )
                        .forEach((e) =>
                            (e.students || []).forEach((s) => {
                                if (validIds.has(s.id)) studentIds.add(s.id);
                            }),
                        );
                    return { name: tipo, total: studentIds.size };
                });
            }

            // ────────── POR GRUPO INDIVIDUAL ──────────
            case "por_grupo": {
                return groups
                    .filter(
                        (g) =>
                            !cfg.filterPeriod ||
                            String(g.period_id) === String(cfg.filterPeriod),
                    )
                    .filter(
                        (g) =>
                            !cfg.filterSpecificType ||
                            resolveEnum(g.type) === cfg.filterSpecificType,
                    )
                    .map((g) => ({
                        name: g.name,
                        total: (g.qualifications || []).filter((q) =>
                            validIds.has(q.student_id),
                        ).length,
                    }))
                    .filter((d) => d.total > 0);
            }

            // ────────── POR EXAMEN INDIVIDUAL ──────────
            case "por_examen": {
                return exams
                    .filter(
                        (e) =>
                            !cfg.filterPeriod ||
                            String(e.period_id) === String(cfg.filterPeriod),
                    )
                    .filter(
                        (e) =>
                            !cfg.filterSpecificType ||
                            resolveEnum(e.exam_type) === cfg.filterSpecificType,
                    )
                    .map((e) => ({
                        name: e.name,
                        total: (e.students || []).filter((s) =>
                            validIds.has(s.id),
                        ).length,
                    }))
                    .filter((d) => d.total > 0);
            }

            // ────────── CURSOS VS EXÁMENES ──────────
            case "cursos_vs_examenes": {
                let cursos = 0;
                let examenes = 0;
                filtered.forEach((s) => {
                    if (
                        s.course_period_ids?.some((id) =>
                            cfg.filterPeriod
                                ? String(id) === String(cfg.filterPeriod)
                                : true,
                        )
                    )
                        cursos++;
                    if (
                        s.exam_period_ids?.some((id) =>
                            cfg.filterPeriod
                                ? String(id) === String(cfg.filterPeriod)
                                : true,
                        )
                    )
                        examenes++;
                });
                return [
                    { name: "En Cursos", total: cursos },
                    { name: "En Exámenes", total: examenes },
                ];
            }

            // ────────── POR SEXO ──────────
            case "genero":
                return [
                    {
                        name: "Hombres",
                        total: filtered.filter((s) => s.gender === "M").length,
                    },
                    {
                        name: "Mujeres",
                        total: filtered.filter((s) => s.gender === "F").length,
                    },
                ];

            // ────────── POR CARRERA ──────────
            case "carrera":
                return degrees
                    .map((deg) => ({
                        name: deg.name,
                        total: filtered.filter((s) => s.degree_id === deg.id)
                            .length,
                    }))
                    .filter((d) => d.total > 0);

            // ────────── POR NIVEL DE INGLÉS ──────────
            case "nivel":
                return levels.map((lvl) => ({
                    name: lvl.level_tecnm,
                    total: filtered.filter((s) => s.level_id === lvl.id).length,
                }));

            // ────────── POR PERIODO ──────────
            case "periodo":
                return periods.map((p) => ({
                    name: p.name,
                    total: filtered.filter((s) =>
                        s.period_ids?.some((id) => String(id) === String(p.id)),
                    ).length,
                }));

            default:
                return [];
        }
    };

    // ─── Título auto-generado ───
    const getChartTitle = (cfg) => {
        const metricas = {
            estatus: "Por Estatus del Alumno",
            tasa_aprobacion: "Índice de Aprobación",
            tipo_curso: "Alumnos por Tipo de Curso",
            tipo_examen: "Alumnos por Tipo de Examen",
            por_grupo: "Alumnos por Grupo",
            por_examen: "Alumnos por Examen",
            cursos_vs_examenes: "Cursos vs Exámenes",
            genero: "Por Sexo",
            carrera: "Por Carrera",
            nivel: "Por Nivel de Inglés",
            periodo: "Por Periodo",
        };
        const poblacion = {
            todos: "",
            vigentes: " — Vigentes",
            egresados: " — Egresados",
        };
        return (
            (metricas[cfg.type] || "Gráfica") +
            (poblacion[cfg.filterType] || "")
        );
    };

    // ═══════════════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════════════
    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gray-100 py-12 print:bg-white print:py-0">
                <Head title="Reportes Dinámicos" />

                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <ModalAlert
                        isOpen={openModal}
                        onClose={() => setOpenModal(false)}
                        type="error"
                        title="Error al registrar"
                        message="Ocurrió un problema."
                    />

                    {/* HEADER CON LOGOS */}
                    {(logos?.logo_sep ||
                        logos?.logo_tecnm ||
                        logos?.logo_itl) && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 px-8 py-5 print:shadow-none print:border-0 print:mb-4 print:px-0">
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center justify-start flex-1">
                                    {logos.logo_sep ? (
                                        <img
                                            src={logos.logo_sep}
                                            alt="Secretaría de Educación Pública"
                                            className="h-14 object-contain"
                                        />
                                    ) : (
                                        <div className="h-14 w-24 bg-gray-100 rounded animate-pulse" />
                                    )}
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    {logos.logo_tecnm ? (
                                        <img
                                            src={logos.logo_tecnm}
                                            alt="Tecnológico Nacional de México"
                                            className="h-16 object-contain mb-1"
                                        />
                                    ) : (
                                        <div className="h-16 w-28 bg-gray-100 rounded animate-pulse" />
                                    )}
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide hidden print:block">
                                        Tecnológico Nacional de México
                                    </p>
                                </div>
                                <div className="flex items-center justify-end flex-1">
                                    {logos.logo_itl ? (
                                        <img
                                            src={logos.logo_itl}
                                            alt="Instituto Tecnológico de Lázaro Cárdenas"
                                            className="h-14 object-contain"
                                        />
                                    ) : (
                                        <div className="h-14 w-24 bg-gray-100 rounded animate-pulse" />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BARRA DE HERRAMIENTAS */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow space-y-4 sm:space-y-0 print:hidden">
                        <div className="flex items-center flex-1 mr-4">
                            <input
                                type="text"
                                value={pageTitle}
                                onChange={(e) => setPageTitle(e.target.value)}
                                className="text-xl font-bold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 bg-transparent w-full p-1 transition-colors"
                                placeholder="Título del Reporte"
                                title="Haz clic para editar el título del reporte"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={addChart}
                                className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase hover:bg-green-700"
                            >
                                + Agregar Gráfica
                            </button>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                            >
                                Imprimir / Descargar PDF
                            </button>
                        </div>
                    </div>

                    {/* TÍTULO VISIBLE SOLO AL IMPRIMIR */}
                    <div className="hidden print:block mb-6 text-center border-b border-gray-300 pb-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {pageTitle}
                        </h1>
                    </div>

                    {/* CONTENEDOR DE GRÁFICAS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-1 gap-6">
                        {charts.map((cfg) => (
                            <div
                                key={cfg.id}
                                className="bg-white rounded-lg shadow flex flex-col print:shadow-none print:break-inside-avoid print:mb-8"
                            >
                                {/* CONTROLES DE CONFIGURACIÓN */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-3 rounded-t-lg print:hidden">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-700">
                                            Configuración del Gráfico
                                        </h3>
                                        <button
                                            onClick={() => removeChart(cfg.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Eliminar
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                        {/* Métrica */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Métrica
                                            </label>
                                            <select
                                                value={cfg.type}
                                                onChange={(e) =>
                                                    updateChart(
                                                        cfg.id,
                                                        "type",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            >
                                                <optgroup label="Demografía">
                                                    <option value="estatus">
                                                        Estatus del Alumno
                                                    </option>
                                                    <option value="genero">
                                                        Sexo / Género
                                                    </option>
                                                    <option value="carrera">
                                                        Carrera
                                                    </option>
                                                    <option value="nivel">
                                                        Nivel de Inglés
                                                    </option>
                                                </optgroup>
                                                <optgroup label="Rendimiento Académico">
                                                    <option value="tasa_aprobacion">
                                                        Tasa de Aprobación
                                                    </option>
                                                    <option value="cursos_vs_examenes">
                                                        Cursos vs Exámenes
                                                    </option>
                                                </optgroup>
                                                <optgroup label="Desglose por Tipo (Enums)">
                                                    <option value="tipo_curso">
                                                        Alumnos por Tipo de
                                                        Curso
                                                    </option>
                                                    <option value="tipo_examen">
                                                        Alumnos por Tipo de
                                                        Examen
                                                    </option>
                                                    <option value="por_grupo">
                                                        Alumnos por Grupo
                                                        Individual
                                                    </option>
                                                    <option value="por_examen">
                                                        Alumnos por Examen
                                                        Individual
                                                    </option>
                                                </optgroup>
                                                <optgroup label="Tiempos">
                                                    <option value="periodo">
                                                        Alumnos por Periodo
                                                    </option>
                                                </optgroup>
                                            </select>
                                        </div>

                                        {/* Población */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Población
                                            </label>
                                            <select
                                                value={cfg.filterType}
                                                onChange={(e) =>
                                                    updateChart(
                                                        cfg.id,
                                                        "filterType",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            >
                                                <option value="todos">
                                                    Todos los alumnos
                                                </option>
                                                <option value="vigentes">
                                                    Solo Vigentes
                                                </option>
                                                <option value="egresados">
                                                    Solo Egresados
                                                </option>
                                            </select>
                                        </div>

                                        {/* Periodo */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Periodo
                                            </label>
                                            <select
                                                value={cfg.filterPeriod}
                                                onChange={(e) =>
                                                    updateChart(
                                                        cfg.id,
                                                        "filterPeriod",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            >
                                                <option value="">
                                                    Todos los periodos
                                                </option>
                                                {periods.map((p) => (
                                                    <option
                                                        key={p.id}
                                                        value={p.id}
                                                    >
                                                        {p.name} ({p.year})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Fuente (Cursos / Exámenes) */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Fuente
                                            </label>
                                            <select
                                                value={cfg.filterCourseType}
                                                onChange={(e) =>
                                                    updateChart(
                                                        cfg.id,
                                                        "filterCourseType",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            >
                                                <option value="todos">
                                                    Todos
                                                </option>
                                                <option value="curso">
                                                    Solo Cursos
                                                </option>
                                                <option value="examen">
                                                    Solo Exámenes
                                                </option>
                                            </select>
                                        </div>

                                        {/* Tipo Específico (enums dinámicos) */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Tipo Específico
                                            </label>
                                            <select
                                                value={cfg.filterSpecificType}
                                                onChange={(e) =>
                                                    updateChart(
                                                        cfg.id,
                                                        "filterSpecificType",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            >
                                                <option value="">
                                                    Todos los tipos
                                                </option>
                                                {getSpecificTypeOptions(
                                                    cfg.filterCourseType,
                                                ).map((opt) => (
                                                    <option
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Grupo/Examen individual (solo para Tasa de Aprobación) */}
                                        {cfg.type === "tasa_aprobacion" && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Grupo/Examen
                                                </label>
                                                <select
                                                    value={cfg.filterEntity}
                                                    onChange={(e) =>
                                                        updateChart(
                                                            cfg.id,
                                                            "filterEntity",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                >
                                                    <option value="">
                                                        Combinado global
                                                    </option>
                                                    {getAvailableEntities(
                                                        cfg,
                                                    ).map((ent) => (
                                                        <option
                                                            key={ent.value}
                                                            value={ent.value}
                                                        >
                                                            {ent.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Título y Descripción personalizados */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Título Personalizado
                                            </label>
                                            <input
                                                type="text"
                                                value={cfg.customTitle}
                                                onChange={(e) =>
                                                    updateChart(
                                                        cfg.id,
                                                        "customTitle",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={getChartTitle(cfg)}
                                                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Descripción para impresión
                                            </label>
                                            <input
                                                type="text"
                                                value={cfg.description}
                                                onChange={(e) =>
                                                    updateChart(
                                                        cfg.id,
                                                        "description",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Nota o resumen para esta gráfica..."
                                                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Descripción solo al imprimir */}
                                {cfg.description && (
                                    <p className="hidden print:block text-gray-600 italic text-sm px-6 pt-3 text-center">
                                        {cfg.description}
                                    </p>
                                )}

                                {/* GRÁFICA */}
                                <div className="p-6 flex-1 flex flex-col justify-center print:p-2">
                                    <Graficas
                                        title={
                                            cfg.customTitle ||
                                            getChartTitle(cfg)
                                        }
                                        chartData={getChartData(cfg)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {charts.length === 0 && (
                        <div className="text-center py-12 text-gray-500 print:hidden">
                            No hay gráficas. Haz clic en &quot;Agregar
                            Gráfica&quot; para comenzar.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
