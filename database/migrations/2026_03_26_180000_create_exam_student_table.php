<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta las migraciones.
     */
    public function up(): void
    {
        Schema::create('exam_student', function (Blueprint $table) {
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->decimal('calificacion', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['exam_id', 'student_id']);
        });
    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_student');
    }
};
