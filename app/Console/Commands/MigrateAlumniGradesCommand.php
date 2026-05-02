<?php

namespace App\Console\Commands;

use App\Models\Group;
use App\Enums\GroupType;
use App\Models\Qualification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateAlumniGradesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:migrate-alumni-grades';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate alumni grades keys from a1, a2, b1 to grade_1, grade_2, grade_3 in units_breakdown JSON';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting migration for Programa Egresados grades...');

        $alumniGroups = Group::where('type', GroupType::PROGRAMA_EGRESADOS->value)->get();

        if ($alumniGroups->isEmpty()) {
            $this->info('No Programa Egresados groups found.');
            return;
        }

        $totalUpdated = 0;

        DB::transaction(function () use ($alumniGroups, &$totalUpdated) {
            foreach ($alumniGroups as $group) {
                $qualifications = Qualification::where('group_id', $group->id)->get();

                foreach ($qualifications as $qualification) {
                    $breakdown = $qualification->units_breakdown;

                    if (!is_array($breakdown)) {
                        continue;
                    }

                    $changed = false;
                    $mapping = [
                        'a1' => 'grade_1',
                        'a2' => 'grade_2',
                        'b1' => 'grade_3',
                    ];

                    foreach ($mapping as $oldKey => $newKey) {
                        if (array_key_exists($oldKey, $breakdown)) {
                            $breakdown[$newKey] = $breakdown[$oldKey];
                            unset($breakdown[$oldKey]);
                            $changed = true;
                        }
                    }

                    if ($changed) {
                        $qualification->update(['units_breakdown' => $breakdown]);
                        $totalUpdated++;
                    }
                }
            }
        });

        $this->info("Migration completed. Total records updated: {$totalUpdated}");
    }
}
