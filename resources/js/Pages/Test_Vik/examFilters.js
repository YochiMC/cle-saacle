const generarClave = (examen) => {
    const tipo = examen.exam_type?.value ?? examen.exam_type ?? "";
    const fecha = examen.application_date ?? "";

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
            const nombre = (exam.name || "").toLowerCase();
            const clave = generarClave(exam).toLowerCase();
            const evaluador = (exam.teacher_name ?? exam.teacher?.full_name ?? "").toLowerCase();
            const aula = (exam.classroom || "").toLowerCase();
            const fecha = (exam.application_date || "").toLowerCase();

            if (
                !nombre.includes(consulta) &&
                !clave.includes(consulta) &&
                !evaluador.includes(consulta) &&
                !aula.includes(consulta) &&
                !fecha.includes(consulta)
            ) {
                return false;
            }
        }

        if (filtros.estado && (exam.status || "").toLowerCase() !== filtros.estado.toLowerCase()) {
            return false;
        }

        const tipoExamen = exam.exam_type?.value ?? exam.exam_type ?? "";
        if (filtros.tipo && tipoExamen !== filtros.tipo) {
            return false;
        }

        return true;
    });

    if (filtros.ordenCupo === "asc") {
        filtrados.sort((a, b) => {
            const dispA = a.available_seats ?? (a.capacity ?? 0) - (a.enrolled_count ?? 0);
            const dispB = b.available_seats ?? (b.capacity ?? 0) - (b.enrolled_count ?? 0);
            return dispA - dispB;
        });
    } else if (filtros.ordenCupo === "desc") {
        filtrados.sort((a, b) => {
            const dispA = a.available_seats ?? (a.capacity ?? 0) - (a.enrolled_count ?? 0);
            const dispB = b.available_seats ?? (b.capacity ?? 0) - (b.enrolled_count ?? 0);
            return dispB - dispA;
        });
    }

    return filtrados;
};
