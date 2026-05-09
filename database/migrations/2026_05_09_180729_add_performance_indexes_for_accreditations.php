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
        Schema::table('groups', function (Blueprint $table) {
            $table->index('period_id');
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->index('period_id');
        });

        Schema::table('qualifications', function (Blueprint $table) {
            $table->index(['student_id', 'group_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->dropIndex(['period_id']);
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->dropIndex(['period_id']);
        });

        Schema::table('qualifications', function (Blueprint $table) {
            $table->dropIndex(['student_id', 'group_id']);
        });
    }
};
