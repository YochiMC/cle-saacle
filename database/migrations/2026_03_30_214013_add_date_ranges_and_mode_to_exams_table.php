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
        Schema::table('exams', function (Blueprint $table) {
            $table->string('mode')->nullable()->after('capacity');
            $table->date('start_date')->nullable()->after('mode');
            $table->date('end_date')->nullable()->after('start_date');
            
            if (Schema::hasColumn('exams', 'application_date')) {
                $table->dropColumn('application_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['mode', 'start_date', 'end_date']);
            $table->date('application_date')->after('capacity')->nullable();
        });
    }
};
