<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Enums\TypeStudent;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // Agregar columna type_student como nullable durante la migración
            $table->string('type_student')->nullable()->after('level_id');
        });

        // Migrar datos de la tabla type_students a la nueva columna
        DB::statement("
            UPDATE students s
            SET s.type_student = LOWER(REPLACE(ts.name, ' ', ''))
            FROM type_students ts
            WHERE s.type_student_id = ts.id
        ");

        // Para SQLite (si lo usas en desarrollo)
        if (DB::getDriverName() === 'sqlite') {
            DB::statement("
                UPDATE students
                SET type_student = LOWER(REPLACE(
                    (SELECT name FROM type_students WHERE type_students.id = students.type_student_id),
                    ' ',
                    ''
                ))
                WHERE type_student_id IS NOT NULL
            ");
        }

        // Para MySQL
        if (DB::getDriverName() === 'mysql') {
            DB::statement("
                UPDATE students s
                INNER JOIN type_students ts ON s.type_student_id = ts.id
                SET s.type_student = LOWER(REPLACE(ts.name, ' ', ''))
            ");
        }

        // Establecer valores por defecto para registros sin tipo de estudiante
        DB::statement("
            UPDATE students
            SET type_student = ?
            WHERE type_student IS NULL OR type_student = ''
        ", [TypeStudent::VIGENTE->value]);

        // Ahora hacer la columna NOT NULL
        Schema::table('students', function (Blueprint $table) {
            $table->string('type_student')->change();
        });

        // Eliminar la foreign key y la columna type_student_id
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['type_student_id']);
            $table->dropColumn('type_student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // Recrear la columna type_student_id
            $table->unsignedBigInteger('type_student_id')->nullable()->after('level_id');
            $table->foreign('type_student_id')->references('id')->on('type_students')->onDelete('restrict');
        });

        // Migrar datos de vuelta
        if (DB::getDriverName() === 'mysql') {
            DB::statement("
                UPDATE students s
                INNER JOIN type_students ts ON LOWER(REPLACE(ts.name, ' ', '')) = s.type_student
                SET s.type_student_id = ts.id
            ");
        }

        // Eliminar la columna type_student
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('type_student');
        });
    }
};
