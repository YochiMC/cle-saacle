<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar caché de permisos antes de empezar
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Crear Permisos (Usa nombres claros)
        Permission::create(['name' => 'read courses']);
        Permission::create(['name' => 'edit courses']);
        Permission::create(['name' => 'delete courses']);
        Permission::create(['name' => 'create courses']);

        Permission::create(['name' => 'read users']);
        Permission::create(['name' => 'edit users']);
        Permission::create(['name' => 'delete users']);
        Permission::create(['name' => 'create users']);

        Permission::create(['name' => 'read inscriptions']);
        Permission::create(['name' => 'edit inscriptions']);
        Permission::create(['name' => 'delete inscriptions']);
        Permission::create(['name' => 'create inscriptions']);

        Permission::create(['name' => 'read documents']);
        Permission::create(['name' => 'edit documents']);
        Permission::create(['name' => 'delete documents']);
        Permission::create(['name' => 'create documents']);

        Permission::create(['name' => 'read payments']);
        Permission::create(['name' => 'edit payments']);
        Permission::create(['name' => 'delete payments']);
        Permission::create(['name' => 'create payments']);

        Permission::create(['name' => 'read grades']);
        Permission::create(['name' => 'edit grades']);
        Permission::create(['name' => 'delete grades']);
        Permission::create(['name' => 'create grades']);

        Permission::create(['name' => 'read reports']);
        Permission::create(['name' => 'edit reports']);
        Permission::create(['name' => 'delete reports']);
        Permission::create(['name' => 'create reports']);

        // 2. Crear Roles y asignar permisos
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo(Permission::all());

        $coordinator = Role::create(['name' => 'coordinator']);
        $coordinator->givePermissionTo(['read courses']);
        $coordinator->givePermissionTo(['edit courses']);
        $coordinator->givePermissionTo(['']);
        $coordinator->givePermissionTo(['create courses']);

        $student = Role::create(['name' => 'student']);
        $student->givePermissionTo(['ver academia']);

        $teacher = Role::create(['name' => 'teacher']);
        $teacher->givePermissionTo(['ver academia']);

    }
}
