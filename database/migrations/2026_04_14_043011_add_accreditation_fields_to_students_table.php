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
        Schema::table('students', function (Blueprint $table) {
            $table->string('accreditation_source')->nullable()->comment('Origen de la acreditación (Ej. Grupo Intermedio 5, Examen Ubicación, TOEFL, etc.)');
            $table->timestamp('accreditation_date')->nullable()->comment('Fecha y hora en que se acreditó oficialmente');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['accreditation_source', 'accreditation_date']);
        });
    }
};
