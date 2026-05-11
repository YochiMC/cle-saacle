<?php

namespace Tests;

use Database\Seeders\DegreeSeeder;
use Database\Seeders\LevelSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Schema;

abstract class TestCase extends BaseTestCase
{
    /**
     * Siembra los roles y catálogos base del sistema antes de cada test.
     *
     * Se ejecuta después de que RefreshDatabase vacía las tablas, por lo que
     * los roles (admin, coordinator, teacher, student) y los catálogos
     * (Level, Degree) están disponibles en todos los tests sin
     * necesidad de crearlos manualmente.
     *
     * Los tipos de estudiante (TypeStudent) ahora se gestionan como un enum,
     * por lo que no requieren sembradura en base de datos.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // En algunos tests (ej. ExampleTest) no se ejecutan migraciones de BD.
        // Solo sembramos cuando las tablas base existen para evitar fallos.
        if (
            Schema::hasTable('permissions') &&
            Schema::hasTable('roles') &&
            Schema::hasTable('levels') &&
            Schema::hasTable('degrees')
        ) {
            $this->seed(RoleSeeder::class);
            $this->seed(LevelSeeder::class);
            $this->seed(DegreeSeeder::class);
        }
    }
}
