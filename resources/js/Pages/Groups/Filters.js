export const filterGroups = ({ items, busqueda, filtros }) => {
    const consulta = busqueda.toLowerCase();

    const filtrados = items.filter((group) => {
        if (consulta) {
            const searchStr = consulta.toLowerCase();
            const matchName = (group.name || '').toLowerCase().includes(searchStr);
            const teacherStr = (group.teacher_name || '').toLowerCase();
            const matchTeacher = teacherStr.includes(searchStr);
            const matchSchedule = (group.schedule || '').toLowerCase().includes(searchStr);
            const matchStudent = (group.students_string || '').toLowerCase().includes(searchStr);

            if (!matchName && !matchTeacher && !matchSchedule && !matchStudent) {
                return false;
            }
        }

        if (filtros.estado && (group.status || "").toLowerCase() !== filtros.estado) {
            return false;
        }

        if (filtros.nivel && String(group.level?.id) !== filtros.nivel) {
            return false;
        }

        return true;
    });

    if (filtros.ordenCupo === "asc") {
        filtrados.sort((a, b) => (a.available_seats || 0) - (b.available_seats || 0));
    } else if (filtros.ordenCupo === "desc") {
        filtrados.sort((a, b) => (b.available_seats || 0) - (a.available_seats || 0));
    }

    return filtrados;
};
