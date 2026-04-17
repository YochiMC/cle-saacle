<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Http\Resources\RoleResource;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
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
        return Inertia::render('Roles/Asignation', [
            'users' => $users,
            'roles' => RoleResource::collection($roles)->resolve(),
            'permissions' => PermissionResource::collection($permissions)->resolve(),
        ]);
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
                $role->is_system = false;
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
     * Update the specified resource in storage.
     */
    public function update(UpdateRoleRequest $request, string $id)
    {
        $validated = $request->validated();

        try {
            $role = Role::query()->findOrFail($id);

            if ($role->is_system) {
                return redirect()->back()->with('error', 'Este rol no se puede modificar ya que es parte del sistema.');
            }

            DB::transaction(function () use ($id, $validated) {
                $role = Role::query()->findOrFail($id);
                $role->update(['name' => $validated['name']]);

                $permissionIds = $validated['permissions'] ?? [];
                $role->syncPermissions($permissionIds);
            });

            return redirect()->back()->with('success', 'Rol actualizado correctamente.');
        } catch (ModelNotFoundException $e) {
            return redirect()->back()->withErrors(['role' => 'El rol que intentas actualizar no existe.']);
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->withErrors(['role' => 'No se pudo actualizar el rol. Intenta nuevamente.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * Elimina un rol por ID y libera sus permisos asociados.
     *
     * @param  string  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(string $id)
    {
        try {
            $role = Role::query()->findOrFail($id);

            if ($role->is_system) {
                return redirect()->back()->with('error', 'Este rol no se puede eliminar ya que es parte del sistema.');
            }

            DB::transaction(function () use ($id) {
                $role = Role::query()->findOrFail($id);

                // Se limpian relaciones antes de eliminar para mantener consistencia en pivotes.
                $role->syncPermissions([]);
                $role->delete();
            });

            return redirect()->back()->with('success', 'Rol eliminado correctamente.');
        } catch (ModelNotFoundException $e) {
            return redirect()->back()->withErrors(['role' => 'El rol que intentas eliminar no existe.']);
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->withErrors(['role' => 'No se pudo eliminar el rol. Intenta nuevamente.']);
        }
    }
}
