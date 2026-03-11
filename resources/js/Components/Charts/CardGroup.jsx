import React from "react";

const CourseCard = ({
    title,
    instructor,
    Id_Grupo,
    Periodo,
    Horario,
    Modalidad,
}) => {
    return (
        <div className="w-full max-w-sm bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#1B396A] h-full flex flex-col">
            {/* Encabezado con color */}
            <div className="h-2 bg-gradient-to-r from-[#1B396A] to-[#142952]"></div>

            {/* Contenido principal */}
            <div className="p-6 space-y-4 flex flex-col flex-grow">
                {/* Título */}
                <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-sm font-semibold text-[#1B396A]">
                        {instructor}
                    </p>
                </div>

                {/* Separador */}
                <div className="border-t border-gray-200"></div>

                {/* Información detallada */}
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                            Grupo:
                        </span>
                        <span className="text-gray-900 font-semibold">
                            {Id_Grupo}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                            Período:
                        </span>
                        <span className="text-gray-900 font-semibold">
                            {Periodo}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                            Horario:
                        </span>
                        <span className="text-gray-900 font-semibold">
                            {Horario}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                            Modalidad:
                        </span>
                        <span className="text-[#1B396A] font-bold bg-blue-50 px-3 py-1 rounded-full text-xs">
                            {Modalidad}
                        </span>
                    </div>
                </div>

                {/* Separador */}
                <div className="border-t border-gray-200"></div>

                {/* Botón */}
                <button className="mt-auto w-full py-3 bg-[#1B396A] text-white font-semibold rounded-lg hover:bg-[#142952] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg">
                    Inscribirse
                </button>
            </div>
        </div>
    );
};

export default CourseCard;
