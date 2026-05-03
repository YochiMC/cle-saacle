<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Group;
use App\Models\Exam;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ResetModelQualifications
{
    /**
     * Resets the units_breakdown to an empty JSON and final_average to null
     * for all related students when the evaluation type changes.
     *
     * @param Group|Exam $model
     * @return void
     * @throws InvalidArgumentException
     */
    public function execute(Group|Exam $model): void
    {
        DB::transaction(function () use ($model) {
            if ($model instanceof Group) {
                // Update all qualifications related to this group
                $model->qualifications()->update([
                    'units_breakdown' => '{}',
                    'final_average'   => 0,
                ]);
            } elseif ($model instanceof Exam) {
                // Update the pivot table for all students enrolled in this exam
                DB::table('exam_student')
                    ->where('exam_id', $model->id)
                    ->update([
                        'units_breakdown' => '{}',
                        'final_average'   => 0,
                    ]);
            } else {
                throw new InvalidArgumentException("Model must be an instance of Group or Exam.");
            }
        });
    }
}
