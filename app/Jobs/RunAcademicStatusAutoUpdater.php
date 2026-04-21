<?php

namespace App\Jobs;

use App\Services\AcademicStatusAutoUpdater;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RunAcademicStatusAutoUpdater implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * El número de segundos después de los cuales el trabajo único se libera.
     */
    public int $uniqueFor = 60;

    /**
     * Execute the job.
     */
    public function handle(AcademicStatusAutoUpdater $updater): void
    {
        // Se inyecta el orquestador y se ejecuta indicando el origen manual
        $updater->run('manual_settings_update');
    }
}
