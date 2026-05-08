<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('exam_student', function (Blueprint $table) {
            $table->boolean('is_left')->default(false)->after('final_average');
        });

        // Transferencia de datos desde el JSON a la nueva columna física
        $rows = DB::table('exam_student')->get();

        foreach ($rows as $row) {
            $units = json_decode($row->units_breakdown, true);

            if (is_array($units) && array_key_exists('is_left', $units)) {
                $isLeft = (bool) $units['is_left'];
                
                // Eliminar la llave del JSON
                unset($units['is_left']);

                DB::table('exam_student')
                    ->where('id', $row->id)
                    ->update([
                        'is_left' => $isLeft,
                        'units_breakdown' => json_encode($units)
                    ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_student', function (Blueprint $table) {
            $table->dropColumn('is_left');
        });
    }
};
