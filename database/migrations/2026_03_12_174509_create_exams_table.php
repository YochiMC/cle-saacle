<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint; // <--- Cambiado aquí
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // He cambiado 'exam' a 'exams' para seguir la convención de Laravel
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            // Asegúrate de que la tabla de alumnos se llame exactamente 'students'
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('nombre_examen');
            $table->decimal('calificacion', 5, 2)->nullable();
            $table->date('fecha_aplicacion');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams'); // <--- Debe coincidir con el nombre de arriba
    }
};
