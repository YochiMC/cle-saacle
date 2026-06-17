<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificate_records', function (Blueprint $table) {
            $table->string('constancy_number', 10)->nullable()->after('validation_code');
        });
    }

    public function down(): void
    {
        Schema::table('certificate_records', function (Blueprint $table) {
            $table->dropColumn('constancy_number');
        });
    }
};
