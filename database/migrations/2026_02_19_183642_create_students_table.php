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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('firstName');
            $table->string('lastName');
            $table->string('numControl')->unique();
            $table->char('gender', 1);
            $table->date('birthDate');
            $table->integer('semester')->min(1)->max(13);
            $table->foreignId('degree_id')->constrained()->onDelete('restrict');
            $table->foreignId('type_student_id')->constrained()->onDelete('restrict');
            $table->foreignId('level_id')->constrained()->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
