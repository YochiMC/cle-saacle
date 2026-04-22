<?php

namespace App\Http\Controllers;

use App\Actions\Catalogs\GetLevelConfigAction;
use App\Actions\Catalogs\GetPeriodConfigAction;
use App\Actions\Catalogs\GetDegreeConfigAction;
use App\Actions\Catalogs\GetTypeStudentConfigAction;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de UI para la Gestión Centralizada de Catálogos.
 * 
 * Este controlador es exclusivo para Inertia (Frontend). Su única responsabilidad
 * es recopilar las configuraciones de los catálogos a través de Action classes
 * (Patrón Estrategia) e inyectarlas en una sola vista de React con pestañas.
 * 
 * Las mutaciones (POST, PUT, DELETE) no pasan por aquí, sino que apuntan a sus
 * controladores de recurso dedicados (ej. LevelController) para respetar SRP.
 */
class CatalogUIController extends Controller
{
    /**
     * Muestra la vista centralizada de catálogos.
     * 
     * Inyecta la configuración completa y la data inicial de los catálogos en
     * la primera carga, permitiendo que el Frontend alterne entre pestañas de
     * manera instantánea sin peticiones asíncronas adicionales.
     */
    public function index(
        GetLevelConfigAction $getLevelConfig,
        GetPeriodConfigAction $getPeriodConfig,
        GetDegreeConfigAction $getDegreeConfig,
        GetTypeStudentConfigAction $getTypeStudentConfig
    ): Response {
        $catalogs = [
            $getLevelConfig->execute(),
            $getPeriodConfig->execute(),
            $getDegreeConfig->execute(),
            $getTypeStudentConfig->execute(),
        ];

        return Inertia::render('Settings/Catalogs', [
            'catalogs' => $catalogs,
        ]);
    }
}

