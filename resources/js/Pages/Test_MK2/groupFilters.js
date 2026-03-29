export const filterGroups = ({ items, busqueda, filtros }) => {
    const consulta = busqueda.toLowerCase();

    const filtrados = items.filter((group) => {
        if (consulta) {
            const nombre = (group.name || "").toLowerCase();
            const maestro = (group.teacher_name || "").toLowerCase();
            const nivel = (group.level?.level_tecnm || "").toLowerCase();

            if (
                !nombre.includes(consulta) &&
                !maestro.includes(consulta) &&
                !nivel.includes(consulta)
            ) {
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
