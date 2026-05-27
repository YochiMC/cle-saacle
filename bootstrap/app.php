<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Inertia\Inertia;
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

        $middleware->trustProxies(at: '*');

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
                // API/JSON: mantener contrato HTTP estándar para consumidores no web.
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'No tienes permisos para realizar esta acción.',
                    ], 403);
                }

                $isInertiaRequest = (bool) $request->header('X-Inertia');
                $isActionRequest = ! $request->isMethod('GET');

                // Acciones Inertia (POST/PUT/PATCH/DELETE): volver al contexto con flash.
                if ($isInertiaRequest && $isActionRequest) {
                    $referer = $request->headers->get('referer');
                    $host = $request->getSchemeAndHttpHost();
                    $safeFallback = url('/');

                    $targetUrl = ($referer && str_starts_with($referer, $host))
                        ? $referer
                        : $safeFallback;

                    return redirect()->to($targetUrl)->with([
                        'error' => 'No tienes permisos para realizar esta acción.',
                    ]);
                }

                // Navegación directa a una vista protegida: mostrar página 403.
                return Inertia::render('Errors/ErrorPage', [
                    'status' => 403,
                    'message' => 'Acceso restringido. No tienes los permisos necesarios para ver esta sección.',
                ])->toResponse($request)->setStatusCode(403);
            }

            // Manejo de otros errores (404, 500) para vista especial en entorno no local.
            if (!app()->environment('local') && ! $request->expectsJson() && in_array($status, [404, 500], true)) {
                return Inertia::render('Errors/ErrorPage', [
                    'status' => $status,
                    'message' => $status === 404 ? 'Página no encontrada' : 'Error interno del servidor',
                ])->toResponse($request)->setStatusCode($status);
            }

            return $response;
        });
    })->create();
