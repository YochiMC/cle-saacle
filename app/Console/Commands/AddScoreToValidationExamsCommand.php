<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AddScoreToValidationExamsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exam:add-score-validation';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add `score` field to units_breakdown for Convalidación exams (penultimate position)';

    public function handle()
    {
        $this->info('Buscando registros en exam_student para exámenes de tipo Convalidación...');

        $rows = DB::table('exam_student')
            ->select('exam_student.*')
            ->join('exams', 'exam_student.exam_id', '=', 'exams.id')
            ->where('exams.exam_type', 'Convalidación')
            ->get();

        $count = 0;

        DB::beginTransaction();
        try {
            foreach ($rows as $row) {
                $units = [];
                if (!empty($row->units_breakdown)) {
                    $decoded = json_decode($row->units_breakdown, true);
                    if (is_array($decoded)) $units = $decoded;
                }

                if (array_key_exists('score', $units)) {
                    continue; // ya tiene score
                }

                // Si no hay keys, creamos score y calificacion_final para mantener la última llave como final
                if (count($units) === 0) {
                    $new = [
                        'score' => 0,
                        'calificacion_final' => 0,
                    ];
                } else {
                    // Insertar 'score' justo antes de la última llave existente
                    $keys = array_keys($units);
                    $lastKey = end($keys);
                    $new = [];
                    foreach ($units as $k => $v) {
                        if ($k === $lastKey) {
                            $new['score'] = 0;
                        }
                        $new[$k] = $v;
                    }
                }

                $json = json_encode($new, JSON_UNESCAPED_UNICODE);

                DB::table('exam_student')
                    ->where('id', $row->id)
                    ->update(['units_breakdown' => $json]);

                $count++;
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }

        $this->info("Registros actualizados: {$count}");
        return 0;
    }
}
