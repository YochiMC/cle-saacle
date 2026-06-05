<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificate_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('generated_by')->constrained('users')->onDelete('cascade'); // Admin que la generó
            $table->string('validation_code', 64)->unique(); // UUID/hash único de verificación
            $table->string('certificate_type', 60); // examen-acreditacion, cursos, otra-institucion, cuatro-habilidades
            $table->string('student_name');
            $table->string('num_control');
            $table->string('carrera')->nullable();
            $table->string('plan_estudios')->nullable();
            $table->decimal('promedio', 5, 2)->nullable();
            $table->string('periodo')->nullable();
            $table->string('nivel', 20)->nullable();   // B1, B2, etc.
            $table->string('no_oficio', 50)->nullable();
            $table->timestamp('issued_at')->useCurrent();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_records');
    }
};
