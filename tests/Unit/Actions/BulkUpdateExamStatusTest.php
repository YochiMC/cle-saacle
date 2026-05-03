<?php

namespace Tests\Unit\Actions;

use App\Actions\BulkUpdateExamStatus;
use App\Enums\AcademicStatus;
use App\Models\Exam;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BulkUpdateExamStatusTest extends TestCase
{
    use RefreshDatabase;

    private BulkUpdateExamStatus $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = new BulkUpdateExamStatus();
    }

    public function test_updates_multiple_exams_and_returns_correct_count(): void
    {
        $exams = Exam::factory()->count(3)->create(['status' => AcademicStatus::PENDING->value]);
        $ids   = $exams->pluck('id')->all();

        $updated = $this->action->execute($ids, AcademicStatus::ACTIVE->value);

        $this->assertSame(3, $updated);
        foreach ($ids as $id) {
            $this->assertDatabaseHas('exams', ['id' => $id, 'status' => AcademicStatus::ACTIVE->value]);
        }
    }

    public function test_skips_exams_already_in_target_status_and_does_not_count_them(): void
    {
        $alreadyActive = Exam::factory()->create(['status' => AcademicStatus::ACTIVE->value]);
        $pending       = Exam::factory()->create(['status' => AcademicStatus::PENDING->value]);

        $updated = $this->action->execute(
            [$alreadyActive->id, $pending->id],
            AcademicStatus::ACTIVE->value
        );

        $this->assertSame(1, $updated);
    }

    public function test_deduplicates_repeated_ids_before_processing(): void
    {
        $exam = Exam::factory()->create(['status' => AcademicStatus::PENDING->value]);

        $updated = $this->action->execute(
            [$exam->id, $exam->id, $exam->id],
            AcademicStatus::ACTIVE->value
        );

        $this->assertSame(1, $updated);
        $this->assertDatabaseHas('exams', ['id' => $exam->id, 'status' => AcademicStatus::ACTIVE->value]);
    }

    public function test_returns_zero_and_does_not_fail_with_empty_array(): void
    {
        $updated = $this->action->execute([], AcademicStatus::ACTIVE->value);

        $this->assertSame(0, $updated);
    }

    public function test_returns_zero_when_all_ids_do_not_exist(): void
    {
        $updated = $this->action->execute([999_001, 999_002], AcademicStatus::GRADING->value);

        $this->assertSame(0, $updated);
    }

    public function test_ignores_nonexistent_ids_and_updates_valid_ones(): void
    {
        $exams = Exam::factory()->count(2)->create(['status' => AcademicStatus::PENDING->value]);
        $ids   = $exams->pluck('id')->push(999_999)->all();

        $updated = $this->action->execute($ids, AcademicStatus::ENROLLING->value);

        $this->assertSame(2, $updated);
    }

    public function test_can_transition_to_every_academic_status(): void
    {
        foreach (AcademicStatus::cases() as $targetStatus) {
            $exam = Exam::factory()->create(['status' => AcademicStatus::PENDING->value]);

            $updated = $this->action->execute([$exam->id], $targetStatus->value);

            if ($targetStatus === AcademicStatus::PENDING) {
                $this->assertSame(0, $updated, "Should skip exam already in status {$targetStatus->value}");
            } else {
                $this->assertSame(1, $updated);
                $this->assertDatabaseHas('exams', ['id' => $exam->id, 'status' => $targetStatus->value]);
            }
        }
    }
}
