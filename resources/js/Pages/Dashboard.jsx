import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Graficas from "@/Components/Charts/Graphics";
import { useState, useMemo } from "react";
import { Mail, ShieldCheck, Activity, Users, BarChart2, History, Search, ChevronUp, ChevronDown } from "lucide-react";
import { usePermission } from "@/Utils/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Estilos reutilizables para los selectores de cada gráfica
// ─────────────────────────────────────────────────────────────────────────────
const selectClass =
    "block pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm bg-gray-50 text-gray-700 w-full md:w-56";

export default function Dashboard({
    auth,
    degrees = [],
    students = [],
    levels = [],
    groups = [],
    exams = [],
    periods = [],
    certificates = [],
}) {
    const { hasRole } = usePermission();
    const isAdminOrCoordinator = hasRole("admin") || hasRole("coordinator");

    // Selectores individuales por gráfica
    const [approvalFilter, setApprovalFilter] = useState("todos");
    const [periodSourceFilter, setPeriodSourceFilter] = useState("ambos");

    // ─── HISTÓRICO GENERAL: filtros y ordenamiento ─────────────────────────
    const [histPeriodFilter, setHistPeriodFilter]   = useState("todos");
    const [histSourceFilter, setHistSourceFilter]   = useState("ambos");
    const [histTypeFilter, setHistTypeFilter]       = useState("todos");
    const [histSearch, setHistSearch]               = useState("");
    const [histPage, setHistPage]                   = useState(1);
    const [histSort, setHistSort]                   = useState({ col: "full_name", dir: "asc" });
    const HIST_PAGE_SIZE = 15;

    // ─── GRÁFICA 1: Total de alumnos inscritos ───────────────────────────────
    const totalStudentsData = [
        { name: "Total Inscritos", total: students.length },
    ];

    // ─── GRÁFICA 2: Histórico de Alumnos por Periodo (todo el tiempo) ──────────
    // Muestra cuántos alumnos únicos participaron en cada periodo,
    // tanto en grupos como en exámenes, de mayor a menor (más antiguo a más reciente).
    const historicData = (() => {
        return [...periods].reverse().map((period) => {
            const uniqueIds = new Set();
            groups
                .filter((g) => String(g.period_id) === String(period.id))
                .forEach((g) => (g.students || []).forEach((s) => uniqueIds.add(s.id)));
            exams
                .filter((e) => String(e.period_id) === String(period.id))
                .forEach((e) => (e.students || []).forEach((s) => uniqueIds.add(s.id)));
            return { name: period.name, total: uniqueIds.size };
        });
    })();

    // ─── GRÁFICA 3: Índice de Aprobación ─────────────────────────────────────
    const approvalData = (() => {
        let qualifications = [];

        const includeGroup = (g) => {
            if (approvalFilter === "todos")     return true;
            if (approvalFilter === "regular")   return g.type === "Regular";
            if (approvalFilter === "intensivo") return g.type === "Intensivo";
            if (approvalFilter === "especial")  return g.type === "Programa Especial";
            return false;
        };

        groups.filter(includeGroup).forEach((g) => {
            (g.qualifications || []).forEach((q) => qualifications.push(q));
        });

        const total     = qualifications.length;
        const aprobados = qualifications.filter(
            (q) => !q.is_left && parseFloat(q.final_average) >= 70
        ).length;

        if (total === 0)
            return [{ name: "Sin calificaciones registradas", total: 0 }];

        return [
            { name: "Aprobados (≥70)",     total: aprobados },
            { name: "No Acreditados (<70)", total: total - aprobados },
        ];
    })();

    // ─── GRÁFICA 4: Alumnos por Tipo de Curso ────────────────────────────────
    // 4 categorías fijas (siempre visibles aunque tengan 0 alumnos):
    //   1. Cursos Regulares  → grupos Regular + Intensivo + Semi intensivo
    //   2. Egresados próx.   → grupos Programa Especial
    //   3. Examen 4H         → exámenes tipo "4 habilidades"
    //   4. Convalidación     → exámenes tipo "Convalidación"
    const courseTypeData = (() => {
        const ids = {
            cursosRegulares: new Set(),
            egresados:       new Set(),
            exam4h:          new Set(),
            convalidacion:   new Set(),
        };

        groups.forEach((g) => {
            const type = g.type;
            (g.students || []).forEach((s) => {
                if (["Regular", "Intensivo", "Semi intensivo"].includes(type)) {
                    ids.cursosRegulares.add(s.id);
                } else if (type === "Programa Especial") {
                    ids.egresados.add(s.id);
                }
            });
        });

        exams.forEach((e) => {
            const type = e.exam_type;
            (e.students || []).forEach((s) => {
                if (type === "4 habilidades")    ids.exam4h.add(s.id);
                else if (type === "Convalidación") ids.convalidacion.add(s.id);
            });
        });

        return [
            { name: "Cursos Regulares",          total: ids.cursosRegulares.size },
            { name: "Egresados próx. a egresar", total: ids.egresados.size       },
            { name: "Examen 4 Habilidades",      total: ids.exam4h.size          },
            { name: "Convalidación",             total: ids.convalidacion.size   },
        ];
    })();

    // ─── GRÁFICA 5: Alumnos por Periodo ──────────────────────────────────────
    const periodData = (() => {
        // Mostrar todos los periodos como barras; el selector filtra la fuente
        return [...periods].reverse().map((period) => {
            const uniqueIds = new Set();

            if (periodSourceFilter !== "examenes") {
                groups
                    .filter((g) => String(g.period_id) === String(period.id))
                    .forEach((g) => (g.students || []).forEach((s) => uniqueIds.add(s.id)));
            }
            if (periodSourceFilter !== "grupos") {
                exams
                    .filter((e) => String(e.period_id) === String(period.id))
                    .forEach((e) => (e.students || []).forEach((s) => uniqueIds.add(s.id)));
            }

            return { name: period.name, total: uniqueIds.size };
        });
    })();

    // ─── GRÁFICA 6: Constancias Generadas ────────────────────────────────────
    // Agrupa por tipo de constancia + tipo de alumno (egresado/actual) para
    // saber exactamente de qué curso es cada constancia generada.
    const certificatesData = (() => {
        if (certificates.length === 0) return [];
        const counts = {};
        certificates.forEach((c) => {
            const tipo    = c.certificate_type || "Constancia";
            const curso   = c.student_type
                ? (c.student_type === "egresado" ? "Egresado" : "Actual")
                : null;
            const nivel   = c.nivel || null;

            // Construir etiqueta: Tipo — Curso (Egresado/Actual) — Nivel
            let key = tipo;
            if (curso)  key += ` — ${curso}`;
            if (nivel)  key += ` — ${nivel}`;

            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total);
    })();

    // ─── HISTÓRICO GENERAL: construye mapa alumno → actividad ─────────────
    const historialData = useMemo(() => {
        // Mapa: studentId → { periodos: Set, tipos: Set }
        const actMap = {};

        const addActivity = (studentId, periodId, tipo) => {
            if (!actMap[studentId]) actMap[studentId] = { periodIds: new Set(), tipos: new Set() };
            if (periodId) actMap[studentId].periodIds.add(String(periodId));
            if (tipo)     actMap[studentId].tipos.add(tipo);
        };

        groups.forEach((g) => {
            const tipo = g.type;
            (g.students || []).forEach((s) => addActivity(s.id, g.period_id, tipo));
        });
        exams.forEach((e) => {
            const tipo = e.exam_type;
            (e.students || []).forEach((s) => addActivity(s.id, e.period_id, tipo));
        });

        // Mapas auxiliares
        const periodMap = {};
        periods.forEach((p) => { periodMap[String(p.id)] = p.name; });

        const SOURCE_GROUPS = new Set(["Regular", "Intensivo", "Semi intensivo", "Programa Especial"]);
        const SOURCE_EXAMS  = new Set(["4 habilidades", "Convalidación"]);

        // Construir filas a partir de students
        let rows = students.map((s) => {
            const act = actMap[s.id] || { periodIds: new Set(), tipos: new Set() };
            const periodNames = [...act.periodIds]
                .map((pid) => periodMap[pid] || pid)
                .join(", ") || "—";
            const tiposArr = [...act.tipos];
            return {
                id:            s.id,
                full_name:     s.full_name || `${s.first_name} ${s.last_name}`,
                num_control:   s.num_control || "—",
                degree:        s.degree || "—",
                level:         s.level || "—",
                status_label:  s.status_label || "—",
                type_student_label: s.type_student_label || "—",
                periodIds:     act.periodIds,
                tipos:         tiposArr,
                periodNames,
                sourceTipos:   tiposArr,
            };
        });

        // Filtro por periodo
        if (histPeriodFilter !== "todos") {
            rows = rows.filter((r) => r.periodIds.has(histPeriodFilter));
        }

        // Filtro por fuente (grupos vs exámenes)
        if (histSourceFilter !== "ambos") {
            rows = rows.filter((r) => {
                if (histSourceFilter === "grupos") {
                    return r.sourceTipos.some((t) => SOURCE_GROUPS.has(t));
                }
                return r.sourceTipos.some((t) => SOURCE_EXAMS.has(t));
            });
        }

        // Filtro por tipo de curso
        if (histTypeFilter !== "todos") {
            const typeMap = {
                regular:  ["Regular", "Intensivo", "Semi intensivo"],
                especial: ["Programa Especial"],
                examen4h: ["4 habilidades"],
                conval:   ["Convalidación"],
            };
            const allowed = typeMap[histTypeFilter] || [];
            rows = rows.filter((r) => r.sourceTipos.some((t) => allowed.includes(t)));
        }

        // Filtro por búsqueda
        if (histSearch.trim()) {
            const q = histSearch.toLowerCase();
            rows = rows.filter(
                (r) =>
                    r.full_name.toLowerCase().includes(q) ||
                    r.num_control.toLowerCase().includes(q) ||
                    r.degree.toLowerCase().includes(q)
            );
        }

        // Ordenamiento
        rows = [...rows].sort((a, b) => {
            const valA = (a[histSort.col] ?? "").toString().toLowerCase();
            const valB = (b[histSort.col] ?? "").toString().toLowerCase();
            return histSort.dir === "asc"
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        });

        return rows;
    }, [students, groups, exams, periods, histPeriodFilter, histSourceFilter, histTypeFilter, histSearch, histSort]);

    const histTotalPages = Math.max(1, Math.ceil(historialData.length / HIST_PAGE_SIZE));
    const histPageData   = historialData.slice((histPage - 1) * HIST_PAGE_SIZE, histPage * HIST_PAGE_SIZE);

    const handleHistSort = (col) => {
        setHistSort((prev) =>
            prev.col === col ? { col, dir: prev.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" }
        );
        setHistPage(1);
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <h2 className="font-bold text-2xl text-gray-800 leading-tight flex items-center gap-2">
                    <Activity className="w-7 h-7 text-indigo-600" />
                    Panel Principal
                </h2>
            }
        >
            <Head title="Panel Principal" />

            <div className="py-8 min-h-screen bg-gray-50/50">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-10">

                    {/* ── SECCIÓN DE USUARIO ──────────────────────────────── */}
                    <div className="bg-white overflow-hidden shadow-lg shadow-indigo-100/50 sm:rounded-3xl border border-indigo-50 relative group transition-all duration-300 hover:shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                        <div className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-28 h-28 rounded-full ring-4 ring-indigo-50 bg-gradient-to-tr from-indigo-600 to-purple-600 flex justify-center items-center text-white text-4xl font-extrabold shadow-xl shrink-0">
                                {auth?.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 mb-3 uppercase tracking-wide">
                                    <ShieldCheck className="w-4 h-4" /> Activo
                                </span>
                                <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
                                    ¡Hola, {auth.user.name}!
                                </h3>
                                <p className="text-gray-500 text-lg flex items-center justify-center md:justify-start gap-2">
                                    <Mail className="w-5 h-5" />
                                    {auth.user.email}
                                </p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0 shadow-sm rounded-2xl">
                                <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 text-center flex-1 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Rol</p>
                                    <p className="text-lg font-bold text-gray-900 capitalize">
                                        {auth.user.roles?.[0]?.name || "Miembro"}
                                    </p>
                                </div>
                                <div className="bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100 text-center flex-1 shadow-sm shrink-0">
                                    <p className="text-sm font-medium text-indigo-500 mb-1">Estado</p>
                                    <p className="text-lg font-bold text-indigo-900 flex items-center justify-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        En línea
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── GRÁFICAS (solo admin / coordinador) ─────────────── */}
                    {isAdminOrCoordinator ? (
                        <div className="space-y-6">
                            {/* Encabezado de sección */}
                            <div className="flex items-center gap-3 px-2 border-b border-gray-200 pb-4">
                                <BarChart2 className="w-7 h-7 text-indigo-500" />
                                <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                                    Estadísticas Generales
                                </h3>
                            </div>

                            {/* ── FILA 1: Total + Actuales vs Egresados ─── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* G1 — Total de alumnos */}
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <Graficas
                                        title="Total de Alumnos Inscritos"
                                        chartData={totalStudentsData}
                                    />
                                </div>

                                {/* G2 — Histórico de Alumnos por Periodo */}
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <Graficas
                                        title="Histórico de Alumnos por Periodo"
                                        chartData={historicData}
                                    />
                                </div>
                            </div>

                            {/* ── FILA 2: Aprobación + Tipo de Curso ─────── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* G3 — Índice de Aprobación */}
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <Graficas
                                        title="Índice de Aprobación"
                                        chartData={approvalData}
                                    >
                                        <select
                                            value={approvalFilter}
                                            onChange={(e) => setApprovalFilter(e.target.value)}
                                            className={selectClass}
                                        >
                                            <option value="todos">Todos los grupos</option>
                                            <option value="regular">Solo Cursos Regulares</option>
                                            <option value="intensivo">Solo Intensivos</option>
                                            <option value="especial">Solo Prog. Especial</option>
                                        </select>
                                    </Graficas>
                                </div>

                                {/* G4 — Alumnos por Tipo de Curso */}
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <Graficas
                                        title="Alumnos por Tipo de Curso"
                                        chartData={courseTypeData}
                                    />
                                </div>
                            </div>

                            {/* ── FILA 3: Por Periodo + Constancias ──────── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* G5 — Alumnos por Periodo */}
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <Graficas
                                        title="Alumnos por Periodo"
                                        chartData={periodData}
                                    >
                                        <select
                                            value={periodSourceFilter}
                                            onChange={(e) => setPeriodSourceFilter(e.target.value)}
                                            className={selectClass}
                                        >
                                            <option value="ambos">Grupos y Exámenes</option>
                                            <option value="grupos">Solo Grupos</option>
                                            <option value="examenes">Solo Exámenes</option>
                                        </select>
                                    </Graficas>
                                </div>

                                {/* G6 — Constancias Generadas */}
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <Graficas
                                        title="Constancias Generadas por Nivel"
                                        chartData={certificatesData}
                                    />
                                </div>
                            </div>

                            {/* ── HISTÓRICO GENERAL ─────────────────────── */}
                            <div className="mt-8 border-t border-gray-200 pt-8">
                                {/* Encabezado */}
                                <div className="flex items-center gap-3 px-2 border-b border-gray-200 pb-4 mb-6">
                                    <History className="w-7 h-7 text-emerald-500" />
                                    <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                                        Histórico General
                                    </h3>
                                    <span className="ml-auto text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full">
                                        {historialData.length} alumno{historialData.length !== 1 ? "s" : ""}
                                    </span>
                                </div>

                                {/* Filtros */}
                                <div className="bg-gray-50 rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-end border border-gray-100">
                                    {/* Búsqueda */}
                                    <div className="flex-1 min-w-[200px] relative">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Buscar</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={histSearch}
                                                onChange={(e) => { setHistSearch(e.target.value); setHistPage(1); }}
                                                placeholder="Nombre, No. Control o Carrera…"
                                                className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Periodo */}
                                    <div className="min-w-[180px]">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Periodo</label>
                                        <select
                                            value={histPeriodFilter}
                                            onChange={(e) => { setHistPeriodFilter(e.target.value); setHistPage(1); }}
                                            className={selectClass}
                                        >
                                            <option value="todos">Todo el sistema</option>
                                            {[...periods].reverse().map((p) => (
                                                <option key={p.id} value={String(p.id)}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Fuente */}
                                    <div className="min-w-[160px]">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Fuente</label>
                                        <select
                                            value={histSourceFilter}
                                            onChange={(e) => { setHistSourceFilter(e.target.value); setHistPage(1); }}
                                            className={selectClass}
                                        >
                                            <option value="ambos">Grupos y Exámenes</option>
                                            <option value="grupos">Solo Grupos</option>
                                            <option value="examenes">Solo Exámenes</option>
                                        </select>
                                    </div>

                                    {/* Tipo de curso */}
                                    <div className="min-w-[180px]">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Tipo de curso</label>
                                        <select
                                            value={histTypeFilter}
                                            onChange={(e) => { setHistTypeFilter(e.target.value); setHistPage(1); }}
                                            className={selectClass}
                                        >
                                            <option value="todos">Todos</option>
                                            <option value="regular">Cursos Regulares</option>
                                            <option value="especial">Programa Especial</option>
                                            <option value="examen4h">Examen 4 Habilidades</option>
                                            <option value="conval">Convalidación</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Tabla */}
                                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                            <tr>
                                                {[
                                                    { col: "full_name",   label: "Nombre" },
                                                    { col: "num_control", label: "No. Control" },
                                                    { col: "degree",      label: "Carrera" },
                                                    { col: "level",       label: "Nivel" },
                                                    { col: "status_label",label: "Estatus" },
                                                    { col: "type_student_label", label: "Tipo Alumno" },
                                                    { col: "periodNames", label: "Periodos" },
                                                ].map(({ col, label }) => (
                                                    <th
                                                        key={col}
                                                        onClick={() => handleHistSort(col)}
                                                        className="px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors whitespace-nowrap"
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            {label}
                                                            {histSort.col === col ? (
                                                                histSort.dir === "asc"
                                                                    ? <ChevronUp className="w-3 h-3" />
                                                                    : <ChevronDown className="w-3 h-3" />
                                                            ) : (
                                                                <span className="w-3 h-3 inline-block" />
                                                            )}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {histPageData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                                        No se encontraron alumnos con los filtros aplicados.
                                                    </td>
                                                </tr>
                                            ) : (
                                                histPageData.map((row, i) => (
                                                    <tr
                                                        key={row.id}
                                                        className={`hover:bg-indigo-50/40 transition-colors ${
                                                            i % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                                                        }`}
                                                    >
                                                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.full_name}</td>
                                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.num_control}</td>
                                                        <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={row.degree}>{row.degree}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                                {row.level}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                                                row.status_label === "Activo"
                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                                    : row.status_label === "Egresado"
                                                                    ? "bg-blue-50 text-blue-700 border-blue-100"
                                                                    : "bg-gray-100 text-gray-600 border-gray-200"
                                                            }`}>
                                                                {row.status_label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.type_student_label}</td>
                                                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px]" title={row.periodNames}>
                                                            {row.periodNames.length > 40
                                                                ? row.periodNames.slice(0, 40) + "…"
                                                                : row.periodNames}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación */}
                                {histTotalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4 px-1">
                                        <p className="text-sm text-gray-500">
                                            Página <strong>{histPage}</strong> de <strong>{histTotalPages}</strong>
                                            {" — "}{historialData.length} registros
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setHistPage((p) => Math.max(1, p - 1))}
                                                disabled={histPage === 1}
                                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                            >
                                                ← Anterior
                                            </button>
                                            {Array.from({ length: Math.min(5, histTotalPages) }, (_, i) => {
                                                const p = Math.max(1, Math.min(histPage - 2, histTotalPages - 4)) + i;
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => setHistPage(p)}
                                                        className={`px-3 py-1.5 text-sm border rounded-md transition ${
                                                            histPage === p
                                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                                : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => setHistPage((p) => Math.min(histTotalPages, p + 1))}
                                                disabled={histPage === histTotalPages}
                                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                            >
                                                Siguiente →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Mensaje de bienvenida para roles sin acceso a estadísticas */
                        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center mt-6">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Activity className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                                ¡Te damos la bienvenida a SAACLE!
                            </h3>
                            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                                Tu panel de control está listo. Utiliza el menú de navegación para acceder a
                                tus grupos, consultar tu información académica y gestionar tus actividades en
                                el sistema.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
