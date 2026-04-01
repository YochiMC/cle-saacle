const generarClave = (examen) => {
    const tipo = examen.exam_type?.value ?? examen.exam_type ?? "";
    const fecha = examen.start_date ?? "";

    const abrevTipo =
        {
            Convalidación: "CONV",
            "Planes anteriores": "PLAN",
            "4 habilidades": "4HAB",
            Ubicación: "UBI",
        }[tipo] ?? tipo.substring(0, 4).toUpperCase();

    if (!fecha) return `${abrevTipo}-???`;

    const [year, month] = fecha.split("-");
    const meses = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
    ];

    const mesStr = meses[parseInt(month, 10) - 1] ?? "???";
    const anioStr = (year ?? "").slice(-2);

    return `${abrevTipo}-${mesStr}${anioStr}`;
};

const formatearFecha = (dateString) => {
    if (!dateString) return "";
    const partes = dateString.split("-");
    if (partes.length !== 3) return dateString;
    const [year, month, day] = partes;
    const date = new Date(year, parseInt(month, 10) - 1, day);
    
    return new Intl.DateTimeFormat('es-MX', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    }).format(date);
};

export const filterExams = ({ items, busqueda, filtros }) => {
    const consulta = busqueda.toLowerCase();

    const filtrados = items.filter((exam) => {
        if (consulta) {
            const searchStr = consulta.toLowerCase();
            const matchName = (exam.name || '').toLowerCase().includes(searchStr);
            const teacherStr = (exam.teacher_name || '').toLowerCase();
            const studentStr = (exam.students_string || '').toLowerCase();
            const matchTeacher = teacherStr.includes(searchStr);
            const matchStudent = studentStr.includes(searchStr);
            
            // UX: Búsqueda por fechas en lenguaje natural (ej. "08 abr 2026")
            const startStr = formatearFecha(exam.start_date);
            const endStr = formatearFecha(exam.end_date);
            const rangoFechas = `del ${startStr} al ${endStr}`.toLowerCase();
            
            const matchDates = 
                (exam.start_date || '').includes(searchStr) || 
                (exam.end_date || '').includes(searchStr) ||
                rangoFechas.includes(searchStr) ||
                startStr.toLowerCase().includes(searchStr) ||
                (exam.application_time || '').toLowerCase().includes(searchStr);

            if (!matchName && !matchTeacher && !matchStudent && !matchDates) {
                return false;
            }
        }

        if (filtros.estado && (exam.status || "").toLowerCase() !== filtros.estado.toLowerCase()) {
            return false;
        }

        // Agregar evaluación para exam_type con coalescencia nula
        if (filtros.exam_type) {
            const tipo = exam.exam_type?.value ?? exam.exam_type ?? "";
            if (tipo.toLowerCase() !== filtros.exam_type.toLowerCase()) {
                return false;
            }
        }

        return true;
    });

    if (filtros.ordenCupo) {
        filtrados.sort((a, b) => {
            const getDispo = (exam) => {
                const cap = exam.capacity ? parseInt(exam.capacity, 10) : 999999;
                const reg = parseInt(exam.registered ?? exam.enrolled_count ?? 0, 10);
                return cap - reg;
            };

            const dispoA = getDispo(a);
            const dispoB = getDispo(b);

            return filtros.ordenCupo === "asc" ? dispoA - dispoB : dispoB - dispoA;
        });
    }

    return filtrados;
};
