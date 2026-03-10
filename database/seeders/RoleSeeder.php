<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Ejecuta la inicialización de roles y permisos del sistema.
     * Define los permisos CRUD para cada recurso y asigna roles específicos
     * con sus respectivos permisos según el nivel de acceso requerido.
     */
    public function run(): void
    {
        // Limpiar caché de permisos antes de empezar
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ============================================================
        // 1. CREAR PERMISOS - Operaciones CRUD por Recurso
        // ============================================================

        // Permisos para Estudiantes
        // Permite gestionar el registro, visualización y edición de estudiantes
        Permission::create(['name' => 'read students']);
        Permission::create(['name' => 'create students']);
        Permission::create(['name' => 'edit students']);
        Permission::create(['name' => 'delete students']);

        // Permisos para Docentes
        // Permite gestionar el registro y información de docentes en el sistema
        Permission::create(['name' => 'read teachers']);
        Permission::create(['name' => 'create teachers']);
        Permission::create(['name' => 'edit teachers']);
        Permission::create(['name' => 'delete teachers']);

        // Permisos para Documentos
        // Permite acceder, crear y administrar documentos del sistema
        Permission::create(['name' => 'read documents']);
        Permission::create(['name' => 'create documents']);
        Permission::create(['name' => 'edit documents']);
        Permission::create(['name' => 'delete documents']);

        // Permisos para Títulos/Grados
        // Permite configurar y mantener los grados académicos disponibles
        Permission::create(['name' => 'read degrees']);
        Permission::create(['name' => 'create degrees']);
        Permission::create(['name' => 'edit degrees']);
        Permission::create(['name' => 'delete degrees']);

        // Permisos para Niveles
        // Permite administrar los niveles educativos del sistema
        Permission::create(['name' => 'read levels']);
        Permission::create(['name' => 'create levels']);
        Permission::create(['name' => 'edit levels']);
        Permission::create(['name' => 'delete levels']);

        // Permisos para Calificaciones
        // Permite registrar, visualizar y modificar calificaciones de estudiantes
        Permission::create(['name' => 'read qualifications']);
        Permission::create(['name' => 'create qualifications']);
        Permission::create(['name' => 'edit qualifications']);
        Permission::create(['name' => 'delete qualifications']);

        // Permisos para Tipos de Estudiantes
        // Permite gestionar las categorías y clasificaciones de estudiantes
        Permission::create(['name' => 'read type students']);
        Permission::create(['name' => 'create type students']);
        Permission::create(['name' => 'edit type students']);
        Permission::create(['name' => 'delete type students']);

        // Permisos para Perfiles
        // Permite visualizar y editar información del perfil de usuarios
        Permission::create(['name' => 'read profiles']);
        Permission::create(['name' => 'create profiles']);
        Permission::create(['name' => 'edit profiles']);
        Permission::create(['name' => 'delete profiles']);

        // ============================================================
        // 2. CREAR ROLES Y ASIGNAR PERMISOS
        // ============================================================

        // ADMINISTRADOR
        // Acceso total al sistema. Puede ejecutar todas las operaciones
        // sobre todos los recursos disponibles en la plataforma.
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo(Permission::all());

        // COORDINADOR
        // Gestiona estudiantes y docentes. Puede ver información de
        // configuración pero no puede eliminar registros críticos.
        // Tiene acceso a reportes y documentos del sistema.
        $coordinator = Role::create(['name' => 'coordinator']);
        $coordinator->givePermissionTo([
            'read students',
            'create students',
            'edit students',
            'read teachers',
            'create teachers',
            'edit teachers',
            'read documents',
            'read degrees',
            'read levels',
            'read qualifications',
            'read type students',
            'read profiles',
        ]);

        // ESTUDIANTE
        // Acceso limitado a su propia información. Puede visualizar
        // su perfil, calificaciones y documentos relacionados con su
        // desempeño académico.
        $student = Role::create(['name' => 'student']);
        $student->givePermissionTo([
            'read profiles',
            'edit profiles',
            'read documents',
            'read qualifications',
        ]);

        // DOCENTE
        // Puede gestionar calificaciones y acceder a información de
        // estudiantes. Visualiza documentos y perfiles para fines
        // académicos y de evaluación.
        $teacher = Role::create(['name' => 'teacher']);
        $teacher->givePermissionTo([
            'read students',
            'read teachers',
            'read qualifications',
            'create qualifications',
            'edit qualifications',
            'read profiles',
            'read documents',
            'read degrees',
            'read levels',
        ]);
    }
}