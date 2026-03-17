import React from 'react';
import ResourceDashboard from '@/Components/ResourceDashboard';

/**
 * Vista de Gestión de Grupo (Dashboard).
 * Actúa como puente para reciclar el componente genérico ResourceDashboard,
 * inyectándole los estudiantes inscritos en el grupo para mostrarlos en la tabla.
 *
 * @param {Object} props
 * @param {Object} props.grupo - El objeto del grupo incluyendo sus relaciones (ej. qualifications.student).
 * @param {Array} props.teachers - Catálogo de docentes para el modal.
 * @param {Array} props.periods - Catálogo de periodos para el modal.
 * @param {Array} props.enrolledStudents - Colección Mock de alumnos matriculados.
 */
export default function GroupView({ grupo, teachers = [], periods = [], enrolledStudents = [] }) {
    
    // Si tienes alumnos reales cargados por relaciones, usaríamos:
    // const alumnos = grupo?.qualifications?.map(q => q.student) || [];
    // Pero como estamos utilizando Mock Data inyectada desde el Backend:
    const alumnos = enrolledStudents;

    // Formateamos las opciones de vista para el ResourceDashboard
    const viewOptions = [
        { value: "alumnos", label: "Alumnos Inscritos" }
    ];

    // Mapeo de datos para ResourceDashboard (espera un objeto con arrays por cada vista)
    const dataMap = {
        alumnos: alumnos
    };

    return (
        <ResourceDashboard 
            title={`Gestión de Grupo: ${grupo?.name || 'N/A'}`}
            dataMap={dataMap}
            viewOptions={viewOptions}
            // Puedes ajustar estas propiedades según lo soporte tu backend y hooks (ej. useDynamicColumns)
            deleteRoute="/alumnos/eliminar-del-grupo" // Ajusta la ruta cuando exista el endpoint
            editableColumns={["firstName", "lastName"]}
            restrictedColumns={["birthDate", "semester", "gender"]}
        />
    );
}
