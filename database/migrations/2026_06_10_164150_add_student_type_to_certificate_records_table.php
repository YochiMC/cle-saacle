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
        Schema::table('certificate_records', function (Blueprint $table) {
            // 'egresado' = vigencia a partir de ser emitida
            // 'actual'   = vigencia a partir de que se egresa
            $table->string('student_type', 20)->default('egresado')->after('pronombre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificate_records', function (Blueprint $table) {
            $table->dropColumn('student_type');
        });
    }
};
