<?php

namespace App\Observers;

use App\Models\Group;
use App\Enums\AcademicStatus;
use App\Actions\Students\ResetStudentsStatusAction;
use App\Actions\Students\AdvanceStudentsLevelAction;
use App\Actions\AutoQueueAccreditationCandidates;

class GroupObserver
{
    public function __construct(
        protected ResetStudentsStatusAction $resetStatusAction,
        protected AdvanceStudentsLevelAction $advanceLevelAction,
        protected AutoQueueAccreditationCandidates $accreditationAction
    ) {}

    /**
     * Maneja los cambios de estado del grupo.
     */
    public function updated(Group $group): void
    {
        if (!$group->wasChanged('status')) {
            return;
        }

        // Caso A: El grupo vuelve a estar "En Espera" (Sincronización de alumnos)
        if ($group->status === AcademicStatus::PENDING) {
            $this->resetStatusAction->execute($group->students());
        }

        // Caso B: El grupo se Cierra (Automatización de Avance y Acreditación)
        if ($group->status === AcademicStatus::COMPLETED) {
            $this->accreditationAction->executeForGroup($group);
            $this->advanceLevelAction->execute($group);
        }
    }

    /**
     * Maneja la eliminación del grupo.
     * Al eliminar un grupo, sus alumnos vuelven a estado "En Espera".
     */
    public function deleted(Group $group): void
    {
        $this->resetStatusAction->execute($group->students());
    }
}
