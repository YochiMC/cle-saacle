<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For each service without period_id, attempt to assign a period based on created_at.
        $services = DB::table('services')->whereNull('period_id')->get();

        foreach ($services as $service) {
            $assigned = null;

            if ($service->created_at) {
                $created = Carbon::parse($service->created_at)->startOfDay();

                $period = DB::table('periods')
                    ->whereDate('start_date', '<=', $created)
                    ->whereDate('end_date', '>=', $created)
                    ->orderByDesc('start_date')
                    ->first();

                if ($period) {
                    $assigned = $period->id;
                }
            }

            if (! $assigned) {
                // Fallback: use active period if available
                $active = DB::table('periods')->where('is_active', true)->orderByDesc('start_date')->first();
                if ($active) {
                    $assigned = $active->id;
                }
            }

            if ($assigned) {
                DB::table('services')->where('id', $service->id)->update(['period_id' => $assigned]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op: irreversible data migration (manual rollback required if needed).
    }
};
