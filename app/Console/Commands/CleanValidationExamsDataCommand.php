<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanValidationExamsDataCommand extends Command
{
    protected $signature = 'exam:clean-validation-data';

    protected $description = 'Clean units_breakdown for Convalidación exams: remove calificacion_final, normalize keys and order (certified_level, score, speaking)';

    public function handle()
    {
        $this->info('Buscando registros de Convalidación en exam_student...');

        $rows = DB::table('exam_student')
            ->select('exam_student.*')
            ->join('exams', 'exam_student.exam_id', '=', 'exams.id')
            ->where('exams.exam_type', 'Convalidación')
            ->get();

        $updated = 0;

        DB::beginTransaction();
        try {
            foreach ($rows as $row) {
                $units = [];
                if (!empty($row->units_breakdown)) {
                    $decoded = json_decode($row->units_breakdown, true);
                    if (is_array($decoded)) $units = $decoded;
                }

                // Determine certified_level: prefer existing english key, else spanish one
                $certified = '';
                if (array_key_exists('certified_level', $units)) {
                    $certified = $units['certified_level'];
                } elseif (array_key_exists('nivel_certificado', $units)) {
                    $certified = $units['nivel_certificado'];
                }

                // Determine score
                $score = 0;
                if (array_key_exists('score', $units)) {
                    $score = is_numeric($units['score']) ? (int)$units['score'] : 0;
                }

                // Determine speaking: prefer 'speaking', else fall back to 'calificacion_final' or 'calificacion'
                $speaking = 0;
                if (array_key_exists('speaking', $units)) {
                    $speaking = is_numeric($units['speaking']) ? (int)$units['speaking'] : $units['speaking'];
                } elseif (array_key_exists('calificacion_final', $units)) {
                    $speaking = is_numeric($units['calificacion_final']) ? (int)$units['calificacion_final'] : $units['calificacion_final'];
                } elseif (array_key_exists('calificacion', $units)) {
                    $speaking = is_numeric($units['calificacion']) ? (int)$units['calificacion'] : $units['calificacion'];
                }

                $new = [
                    'certified_level' => $certified ?? '',
                    'score' => (int)$score,
                    'speaking' => $speaking ?? 0,
                ];

                $json = json_encode($new, JSON_UNESCAPED_UNICODE);

                DB::table('exam_student')
                    ->where('id', $row->id)
                    ->update(['units_breakdown' => $json]);

                $updated++;
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }

        $this->info("Registros actualizados: {$updated}");
        return 0;
    }
}
