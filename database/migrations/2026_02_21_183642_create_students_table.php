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
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('num_control')->unique();
            $table->char('gender', 1);
            $table->date('birthdate');
            $table->integer('semester')->nullable();
            $table->string('status')->default('current');
            $table->foreignId('degree_id')->constrained()->restrictOnDelete();
            $table->foreignId('type_student_id')->constrained()->restrictOnDelete();
            $table->foreignId('level_id')->constrained()->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();
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
