<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint; // Esta es la clase correcta
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Cambiamos Table por Blueprint
        Schema::create('validaciones', function (Blueprint $table) {
            $table->id();
            // Asegúrate que la tabla de alumnos se llame 'students' en tu DB
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('tipo_validacion'); // Ej: Documentación, Pago, Nivel
            $table->boolean('estado')->default(false); // Validado o No
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // El nombre debe ser el mismo que pusiste en el Schema::create
        Schema::dropIfExists('validaciones');
    }
};
