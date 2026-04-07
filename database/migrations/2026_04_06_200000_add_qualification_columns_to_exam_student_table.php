<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Añade soporte para calificaciones dinámicas (JSON) a la tabla pivot exam_student.
 *
 * - units_breakdown: Almacena el desglose de calificaciones por unidad/habilidad
 *   como JSON. Su estructura varía según el ExamType del examen.
 * - final_average: Promedio calculado por el frontend y persistido aquí.
 * - calificacion: Se mantiene nullable para compatibilidad retroactiva.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_student', function (Blueprint $table) {
            // PK autoincremental para poder actualizar registros individuales por ID.
            $table->id()->first();

            // Compatibilidad retroactiva: la columna existente pasa a ser nullable.
            $table->decimal('calificacion', 5, 2)->nullable()->change();

            // Nuevas columnas para el sistema de calificaciones dinámicas.
            $table->json('units_breakdown')->nullable()->after('calificacion');
            $table->integer('final_average')->default(0)->after('units_breakdown');
        });
    }

    public function down(): void
    {
        Schema::table('exam_student', function (Blueprint $table) {
            $table->dropColumn(['id', 'units_breakdown', 'final_average']);
            $table->decimal('calificacion', 5, 2)->nullable(false)->change();
        });
    }
};
