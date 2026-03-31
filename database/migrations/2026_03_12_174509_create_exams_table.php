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
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('exam_type'); // 'Convalidación', 'Planes anteriores', '4 habilidades', 'Ubicación'
            $table->integer('capacity');
            $table->date('application_date');
            $table->string('application_time')->nullable();
            $table->string('classroom')->nullable();
            $table->string('status')->default('active');
            $table->foreignId('period_id')->constrained('periods')->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
