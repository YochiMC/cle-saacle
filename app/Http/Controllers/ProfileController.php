<?php

namespace App\Http\Controllers;

use App\Actions\DeleteStudentWithUser;
use App\Actions\DeleteTeacherWithUser;
use App\Http\Resources\UserResource;
use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Degree;
use App\Models\Level;
use App\Models\TypeStudent;
use App\Models\User;
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
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/User/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Display an admin profile view for a specific user.
     */
    public function show(User $user): Response
    {
        // Cargamos las relaciones para mapear correctamente teacher/student en UserResource.
        $user->loadMissing([
            'teacher',
            'student.degree',
            'student.level',
            'student.typeStudent',
        ]);

        return Inertia::render('Profile/Users/Edit', [
            'user' => UserResource::make($user),
            'degrees' => Degree::all(['id', 'name']),
            'levels' => Level::all(['id', 'level_tecnm']),
            'typeStudents' => TypeStudent::all(['id', 'name']),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
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
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

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
    ): RedirectResponse
    {
        // Regla de seguridad: evitar auto-eliminación desde el panel administrativo.
        if ($user->id === Auth::id()) {
            return Redirect::back()->with('error', 'No puedes eliminar tu propio usuario desde esta vista.');
        }

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
