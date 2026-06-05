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
            $table->string('pronombre')->default('el')->nullable()->after('student_name');
            $table->text('student_name_edited')->nullable()->after('pronombre');
            $table->string('carrera_edited')->nullable()->after('student_name_edited');
            $table->float('promedio_edited')->nullable()->after('carrera_edited');
            $table->string('nivel_edited')->nullable()->after('promedio_edited');
            $table->string('status')->default('draft')->after('nivel_edited'); // draft, confirmed, issued
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificate_records', function (Blueprint $table) {
            $table->dropColumn(['pronombre', 'student_name_edited', 'carrera_edited', 'promedio_edited', 'nivel_edited', 'status']);
        });
    }
};
