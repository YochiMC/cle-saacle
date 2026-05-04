<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('legacy_qualifications', function (Blueprint $table) {
            $table->id();

            // FK → students (bigIncrements), elimina la calificación si el alumno es borrado
            $table->foreignId('student_id')
                  ->constrained()
                  ->cascadeOnDelete();

            // FK → levels (bigIncrements), protege el catálogo de niveles
            $table->foreignId('level_id')
                  ->constrained()
                  ->restrictOnDelete();

            // Periodo textual, ej. "Ene-Jun 2023"
            $table->string('period');

            // Calificación final histórica con dos decimales (ej. 8.50)
            $table->decimal('final_grade', 5, 2);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('legacy_qualifications');
    }
};
