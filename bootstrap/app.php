<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);

        //
    })

    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function ($response, Throwable $e, Request $request) {
            $status = $response->getStatusCode();

        if ($status === 403) {
            // Caso A: Es una petición de Inertia (XHR) para una acción (ej. borrar, editar)
            if ($request->header('X-Inertia')) {
                return back()->with([
                    'error' => 'No tienes permisos para realizar esta acción.',
                ]);
            }

            // Caso B: Es una navegación directa a una página prohibida
            return Inertia\Inertia::render('Errors/ErrorPage', [
                'status' => 403,
                'message' => 'Acceso restringido. No tienes los permisos necesarios para ver esta sección.'
            ])->toResponse($request)->setStatusCode(403);
        }

        // Manejo de otros errores (404, 500) para vista especial
        if (!app()->environment('local') && in_array($status, [404, 500])) {
            return Inertia\Inertia::render('Errors/ErrorPage', [
                'status' => $status,
                'message' => $status === 404 ? 'Página no encontrada' : 'Error interno del servidor'
            ])->toResponse($request)->setStatusCode($status);
        }

        return $response;
        });
    })->create();
