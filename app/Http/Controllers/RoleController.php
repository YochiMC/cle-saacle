<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Http\Resources\RoleResource;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Resources\PermissionResource;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $users = User::with('roles')->get();
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();
        return Inertia::render('TestYochi/RolesPermissions/Asignation', [
            'users' => $users,
            'roles' => RoleResource::collection($roles)->resolve(),
            'permissions' => PermissionResource::collection($permissions)->resolve(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * Crea un nuevo rol y sincroniza los permisos seleccionados.
     *
     * Reglas aplicadas:
     * - El nombre del rol es obligatorio y único.
     * - Los permisos son opcionales, pero si se envían deben existir.
     *
     * @param  \App\Http\Requests\StoreRoleRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreRoleRequest $request)
    {
        $validated = $request->validated();

        try {
            DB::transaction(function () use ($validated) {
                $role = Role::create(['name' => $validated['name']]);

                $permissionIds = $validated['permissions'] ?? [];
                $role->syncPermissions($permissionIds);
            });

            return redirect()->back()->with('success', 'Rol creado exitosamente.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()
                ->withErrors(['role' => 'No se pudo crear el rol. Intenta nuevamente.'])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(\Illuminate\Http\Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
        
    }
}
