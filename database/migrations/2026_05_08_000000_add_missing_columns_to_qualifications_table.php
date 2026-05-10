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
        Schema::table('qualifications', function (Blueprint $table) {
            if (!Schema::hasColumn('qualifications', 'is_approved')) {
                $table->boolean('is_approved')->default(false)->after('final_average');
            }
            if (!Schema::hasColumn('qualifications', 'attempt')) {
                $table->integer('attempt')->default(1)->after('is_approved');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('qualifications', function (Blueprint $table) {
            $table->dropColumn(['is_approved', 'attempt']);
        });
    }
};
