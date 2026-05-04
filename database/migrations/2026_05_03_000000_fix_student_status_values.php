<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Enums\StudentStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Mapeo de valores históricos/invalidos hacia valores válidos del enum.
        $mapping = [
            'inhabilitado' => StudentStatus::SUSPENDED->value,
            'inhabilitada' => StudentStatus::SUSPENDED->value,
            'inhabil' => StudentStatus::SUSPENDED->value,
            // Añadir más mapeos si se detectan otros valores locales.
        ];

        $allowed = array_map(fn($c) => $c->value, StudentStatus::cases());

        DB::table('students')->orderBy('id')->chunkById(200, function ($rows) use ($mapping, $allowed) {
            foreach ($rows as $row) {
                $current = $row->status;
                if (is_null($current) || $current === '') {
                    // No tocar valores nulos/vacíos: opcionalmente asignar un valor por defecto si se desea.
                    continue;
                }

                $normalized = mb_strtolower(trim($current));

                if (in_array($normalized, $allowed, true)) {
                    continue; // ya es un valor válido
                }

                if (isset($mapping[$normalized])) {
                    $new = $mapping[$normalized];
                } else {
                    // Valor desconocido: asignar `waiting` por seguridad conservadora.
                    $new = StudentStatus::WAITING->value;
                }

                DB::table('students')->where('id', $row->id)->update(['status' => $new]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No revertible automáticamente: dejamos vacío por seguridad.
    }
};
