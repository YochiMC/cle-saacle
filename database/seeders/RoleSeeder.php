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

        // Guard principal del sistema para autenticación web.
        $guard = 'web';

        // ============================================================
        // 1. CREAR PERMISOS - Operaciones CRUD por Recurso
        // ============================================================

        // Permisos para Estudiantes
        // Permite gestionar el registro, visualización y edición de estudiantes
        $permissions = [
            'read students',
            'create students',
            'edit students',
            'delete students',

            // Permisos para Docentes
            // Permite gestionar el registro y la información de docentes en el sistema
            'read teachers',
            'create teachers',
            'edit teachers',
            'delete teachers',

            // Permisos para Documentos
            // Permite acceder, crear y administrar documentos del sistema
            'read documents',
            'create documents',
            'edit documents',
            'delete documents',

            // Permisos para Títulos/Grados
            // Permite configurar y mantener los grados académicos disponibles
            'read degrees',
            'create degrees',
            'edit degrees',
            'delete degrees',

            // Permisos para Niveles
            // Permite administrar los niveles educativos del sistema
            'read levels',
            'create levels',
            'edit levels',
            'delete levels',

            // Permisos para Calificaciones
            // Permite registrar, visualizar y modificar calificaciones de estudiantes
            'read qualifications',
            'create qualifications',
            'edit qualifications',
            'delete qualifications',

            // Permisos para Tipos de Estudiantes
            // Permite gestionar las categorías y clasificaciones de estudiantes
            'read type students',
            'create type students',
            'edit type students',
            'delete type students',

            // Permisos para Perfiles
            // Permite visualizar y editar información del perfil de usuarios
            'read profiles',
            'create profiles',
            'edit profiles',
            'delete profiles',
        ];

        foreach ($permissions as $permissionName) {
            Permission::findOrCreate($permissionName, $guard);
        }

        // ============================================================
        // 2. CREAR ROLES Y ASIGNAR PERMISOS
        // ============================================================

        // ADMINISTRADOR
        // Acceso total al sistema. Puede ejecutar todas las operaciones
        // sobre todos los recursos disponibles en la plataforma.
        $admin = Role::findOrCreate('admin', $guard);
        $admin->syncPermissions($permissions);
        $admin->is_system = true;
        $admin->save();

        // COORDINADOR
        // Gestiona estudiantes y docentes. Puede ver información de
        // configuración pero no puede eliminar registros críticos.
        // Tiene acceso a reportes y documentos del sistema.
        $coordinator = Role::findOrCreate('coordinator', $guard);
        $coordinator->syncPermissions([
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
        $coordinator->is_system = true;
        $coordinator->save();

        // ESTUDIANTE
        // Acceso limitado a su propia información. Puede visualizar
        // su perfil, calificaciones y documentos relacionados con su
        // desempeño académico.
        $student = Role::findOrCreate('student', $guard);
        $student->syncPermissions([
            'read profiles',
            'edit profiles',
            'read documents',
            'read qualifications',
        ]);
        $student->is_system = true;
        $student->save();

        // DOCENTE
        // Puede gestionar calificaciones y acceder a información de
        // estudiantes. Visualiza documentos y perfiles para fines
        // académicos y de evaluación.
        $teacher = Role::findOrCreate('teacher', $guard);
        $teacher->syncPermissions([
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
        $teacher->is_system = true;
        $teacher->save();

        // Limpiar caché al finalizar para evitar inconsistencias entre requests.
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
