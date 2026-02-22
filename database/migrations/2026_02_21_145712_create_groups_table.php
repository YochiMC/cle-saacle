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
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('mode');
            $table->string('type');
            $table->integer('capacity');
            $table->string('schedule');
            $table->string('classroom')->nullable();
            $table->string('link')->nullable();
            $table->foreignId('period_id')->constrained();
            $table->foreignId('teacher_id')->constrained();
            $table->foreignId('level_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('groups');
    }
};
