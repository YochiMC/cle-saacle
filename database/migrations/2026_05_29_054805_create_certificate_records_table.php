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
            $table->foreignId('student_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete(); // Admin que la generó
            $table->string('validation_code', 64)->unique(); // UUID/hash único de verificación
            $table->string('certificate_type', 60); // examen-acreditacion, cursos, otra-institucion, cuatro-habilidades
            $table->string('student_name');
            $table->string('pronombre', 16)->default('el');
            $table->string('num_control');
            $table->string('carrera')->nullable();
            $table->string('plan_estudios')->nullable();
            $table->decimal('promedio', 5, 2)->nullable();
            $table->string('periodo')->nullable();
            $table->string('nivel', 20)->nullable();   // B1, B2, etc.
            $table->string('no_oficio', 50)->nullable();
            $table->string('signer_one_name')->nullable();
            $table->string('signer_one_title')->nullable();
            $table->string('signer_two_name')->nullable();
            $table->string('signer_two_title')->nullable();
            $table->string('status')->default('draft');
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
