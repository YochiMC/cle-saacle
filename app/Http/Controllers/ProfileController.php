<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;
use App\Actions\DeleteStudentWithUser;
use App\Actions\DeleteTeacherWithUser;
use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Http\Resources\DocumentResource;
use App\Http\Resources\UserResource;
use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Requests\DeleteProfileRequest;
use App\Models\Degree;
use App\Models\Level;
use App\Models\User;
use App\Enums\TypeStudent;
use Spatie\Permission\Models\Role;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Devuelve los tipos de documento permitidos según el rol del usuario.
     *
     * @param User $user
     * @return array<int, array{value: string, label: string}>
     */
    private function resolveDocumentTypeOptions(User $user): array
    {
        if ($user->hasRole('teacher')) {
            return DocumentType::requiredSelectFor('teacher');
        }

        if ($user->hasRole('student')) {
            return DocumentType::requiredSelectFor('student');
        }

        return DocumentType::toSelect();
    }

    /**
     * Determina si la autoedición debe exponer el módulo de documentos.
     */
    private function canManageDocuments(User $user): bool
    {
        return $user->hasAnyRole('teacher', 'student');
    }

    /**
     * Construye el contrato de documentos para la vista de autoedición.
     *
     * @return array{canManageDocuments: bool, documents: array<int, mixed>, documentTypes: array<int, array{value: string, label: string}>}
     */
    private function resolveSelfDocumentProps(User $user): array
    {
        $canManageDocuments = $this->canManageDocuments($user);

        return [
            'canManageDocuments' => $canManageDocuments,
            'documents' => $canManageDocuments
                ? DocumentResource::collection($user->documents()->latest()->get())->resolve()
                : [],
            'documentTypes' => $canManageDocuments
                ? $this->resolveDocumentTypeOptions($user)
                : [],
        ];
    }

    /**
     * Muestra el formulario de autoedición del usuario autenticado.
     */
    public function edit(Request $request): Response
    {
        Gate::authorize('view', $request->user());

        $user = $request->user();
        $documentProps = $this->resolveSelfDocumentProps($user);

        return Inertia::render('Profile/User/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
        ] + $documentProps);
    }

    /**
     * Muestra el perfil administrativo de un usuario específico.
     */
    public function show(User $user): Response
    {
        Gate::authorize('view', $user);

        $user->loadMissing([
            'documents',
            'teacher',
            'student.degree',
            'student.level',
        ]);

        $documentTypeOptions = $this->resolveDocumentTypeOptions($user);

        return Inertia::render('Profile/Users/Edit', [
            'roles' => Role::all(),
            'user' => UserResource::make($user),
            'hasStudent' => (bool) $user->student,
            'degrees' => Degree::all(['id', 'name']),
            'levels' => Level::all(['id', 'level_tecnm']),
            'typeStudents' => TypeStudent::getOptions(),
            'documentStatuses' => DocumentStatus::reviewOptions(),
            'documentTypes' => $documentTypeOptions,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        Gate::authorize('update', $request->user());
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(DeleteProfileRequest $request): RedirectResponse
    {
        Gate::authorize('delete', $request->user());
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function delete(
        User $user,
        DeleteStudentWithUser $deleteStudentWithUser,
        DeleteTeacherWithUser $deleteTeacherWithUser
    ): RedirectResponse {
        // Regla de seguridad: evitar auto-eliminación desde el panel administrativo.
        if ($user->id === Auth::id()) {
            return Redirect::back()->with('error', 'No puedes eliminar tu propio usuario desde esta vista.');
        }

        Gate::authorize('delete', $user);

        // Usamos relaciones reales del modelo para decidir la estrategia de borrado.
        $user->loadMissing(['student', 'teacher']);

        if ($user->student) {
            $deleteStudentWithUser->execute($user->student);
        } elseif ($user->teacher) {
            $deleteTeacherWithUser->execute($user->teacher);
        } else {
            // Fallback para usuarios sin perfil vinculado.
            $user->delete();
        }

        return Redirect::route('users')->with('success', 'Usuario eliminado correctamente.');
    }
}
