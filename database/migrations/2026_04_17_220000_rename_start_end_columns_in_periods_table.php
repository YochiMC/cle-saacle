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
        if (Schema::hasColumn('periods', 'start') && ! Schema::hasColumn('periods', 'start_date')) {
            Schema::table('periods', function (Blueprint $table) {
                $table->renameColumn('start', 'start_date');
            });
        }

        if (Schema::hasColumn('periods', 'end') && ! Schema::hasColumn('periods', 'end_date')) {
            Schema::table('periods', function (Blueprint $table) {
                $table->renameColumn('end', 'end_date');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('periods', 'start_date') && ! Schema::hasColumn('periods', 'start')) {
            Schema::table('periods', function (Blueprint $table) {
                $table->renameColumn('start_date', 'start');
            });
        }

        if (Schema::hasColumn('periods', 'end_date') && ! Schema::hasColumn('periods', 'end')) {
            Schema::table('periods', function (Blueprint $table) {
                $table->renameColumn('end_date', 'end');
            });
        }
    }
};
