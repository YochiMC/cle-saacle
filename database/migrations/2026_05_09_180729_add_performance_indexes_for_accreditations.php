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
            $table->index('status');
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->index('period_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->dropIndex(['period_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->dropIndex(['period_id']);
            $table->dropIndex(['status']);
        });
    }
};
