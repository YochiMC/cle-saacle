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

            $table->string('signer_one_name')->nullable();
            $table->string('signer_one_title')->nullable();

            $table->string('signer_two_name')->nullable();
            $table->string('signer_two_title')->nullable();
        });
    }


    public function down(): void
    {
        Schema::table('certificate_records', function (Blueprint $table) {
            //
        });
    }
};