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
            const matchDates = (exam.start_date || '').includes(searchStr) || (exam.end_date || '').includes(searchStr);

            if (!matchName && !matchTeacher && !matchStudent && !matchDates) {
                return false;
            }
        }

        if (filtros.estado && (exam.status || "").toLowerCase() !== filtros.estado.toLowerCase()) {
            return false;
        }

        if (filtros.period && String(exam.period_id ?? "") !== String(filtros.period)) {
            return false;
        }

        if (filtros.mode && (exam.mode || "").toLowerCase() !== filtros.mode.toLowerCase()) {
            return false;
        }

        return true;
    });

    return filtrados;
};
