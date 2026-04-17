<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AcademicStatusAutoUpdater;

class UpdateAcademicStatuses extends Command
{
    /**
     * El nombre y firma del comando en consola.
     *
     * @var string
     */
    protected $signature = 'saacle:update-statuses';

    /**
     * Descripción del comando en consola.
     *
     * @var string
     */
    protected $description = 'Actualiza automáticamente el estado de Grupos y Exámenes basándose en el calendario configurado en Settings';

    /**
     * Ejecutar el comando.
     */
    public function handle(AcademicStatusAutoUpdater $updater)
    {
        $this->info('Iniciando proceso de actualización de estados académicos...');
        
        $updater->run();
        
        $this->info('La tarea de actualización finalizó con éxito. Revisa el log de Laravel para más detalles sobre los registros afectados.');
    }
}
