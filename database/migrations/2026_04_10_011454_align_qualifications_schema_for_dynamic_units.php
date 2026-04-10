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
            if (!Schema::hasColumn('qualifications', 'units_breakdown')) {
                $table->json('units_breakdown')->nullable()->after('id');
            }
        });

        // Migración de datos existentes para evitar pérdida
        \Illuminate\Support\Facades\DB::table('qualifications')->chunkById(100, function ($qualifications) {
            foreach ($qualifications as $qual) {
                // Solo migrar si unit_1 o unit_2 existen como prop en el row
                if (property_exists($qual, 'unit_1') || property_exists($qual, 'unit_2')) {
                    $units = [];
                    if (isset($qual->unit_1)) $units['unit_1'] = $qual->unit_1;
                    if (isset($qual->unit_2)) $units['unit_2'] = $qual->unit_2;
                    
                    \Illuminate\Support\Facades\DB::table('qualifications')
                        ->where('id', $qual->id)
                        ->update(['units_breakdown' => json_encode($units)]);
                }
            }
        });

        // Eliminar columnas duras antiguas
        Schema::table('qualifications', function (Blueprint $table) {
            if (Schema::hasColumn('qualifications', 'unit_1')) {
                $table->dropColumn('unit_1');
            }
            if (Schema::hasColumn('qualifications', 'unit_2')) {
                $table->dropColumn('unit_2');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('qualifications', function (Blueprint $table) {
            $table->integer('unit_1')->nullable();
            $table->integer('unit_2')->nullable();
            $table->dropColumn('units_breakdown');
        });
    }
};
