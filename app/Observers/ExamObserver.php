<?php

namespace App\Observers;

use App\Models\Exam;
use App\Enums\AcademicStatus;
use App\Actions\Students\ResetStudentsStatusAction;
use App\Actions\Students\AssignPlacementLevelAction;
use App\Actions\AutoQueueAccreditationCandidates;

class ExamObserver
{
    public function __construct(
        protected ResetStudentsStatusAction $resetStatusAction,
        protected AssignPlacementLevelAction $assignLevelAction,
        protected AutoQueueAccreditationCandidates $accreditationAction
    ) {}

    /**
     * Maneja los cambios de estado del examen.
     */
    public function updated(Exam $exam): void
    {
        if (!$exam->wasChanged('status')) {
            return;
        }

        // Caso A: Sincronización a WAITING
        if ($exam->status === AcademicStatus::PENDING) {
            $this->resetStatusAction->execute($exam->students());
        }

        // Caso B: Cierre de Examen (Automatización de Acreditación y Ubicación)
        if ($exam->status === AcademicStatus::COMPLETED) {
            $this->accreditationAction->executeForExam($exam);
            $this->assignLevelAction->execute($exam);
        }
    }

    /**
     * Maneja la eliminación del examen.
     */
    public function deleted(Exam $exam): void
    {
        $this->resetStatusAction->execute($exam->students());
    }
}
