<?php

namespace App\Observers;

use App\Models\Exam;
use App\Enums\AcademicStatus;
use App\Actions\Students\ResetStudentsStatusAction;
use App\Actions\Students\AdvanceStudentsLevelAction;
use App\Actions\Students\AssignPlacementLevelAction;
use App\Actions\AutoQueueAccreditationCandidates;
use App\Actions\Students\RevertStudentsLevelAction;

class ExamObserver
{
    public function __construct(
        protected ResetStudentsStatusAction $resetStatusAction,
        protected AdvanceStudentsLevelAction $advanceLevelAction,
        protected AssignPlacementLevelAction $assignLevelAction,
        protected AutoQueueAccreditationCandidates $autoQueueAccreditationCandidates,
        protected RevertStudentsLevelAction $revertLevelAction
    ) {}

    /**
     * Maneja los cambios de estado del examen.
     */
    public function updated(Exam $exam): void
    {
        if (!$exam->wasChanged('status')) {
            return;
        }

        $oldStatus = $exam->getOriginal('status');

        // Caso de Reversión: El examen deja de estar COMPLETED
        if ($oldStatus === AcademicStatus::COMPLETED && $exam->status !== AcademicStatus::COMPLETED) {
            $this->revertLevelAction->executeForExam($exam);
        }

        // Caso A: Sincronización a WAITING
        if ($exam->status === AcademicStatus::PENDING) {
            $this->resetStatusAction->execute($exam->students());
        }

        // Caso B: Cierre de Examen (Automatización de Acreditación y Ubicación)
        if ($exam->status === AcademicStatus::COMPLETED) {
            $this->advanceLevelAction->executeForExam($exam);
            $this->assignLevelAction->execute($exam);
            $this->autoQueueAccreditationCandidates->executeForExam($exam);
        }
    }

    /**
     * Maneja la eliminación del examen.
     */
    public function deleted(Exam $exam): void
    {
        if ($exam->students()->exists()) {
            $this->resetStatusAction->execute($exam->students());
        }
    }
}
