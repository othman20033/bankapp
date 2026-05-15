<?php

use App\Exceptions\BankException;
use App\Http\Middleware\EnsureUserRole;
use App\Http\Middleware\ForceJsonResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // CORS pour le frontend React (configurable dans config/cors.php)
        $middleware->validateCsrfTokens(except: ['api/*']);

        // Toutes les routes API → JSON
        $middleware->api(prepend: [
            ForceJsonResponse::class,
        ]);

        // Sanctum stateful pour SPA (cookies cross-origin sécurisés)
        $middleware->statefulApi();

        // Alias des middlewares custom
        $middleware->alias([
            'role' => EnsureUserRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Toutes les exceptions métier BankException ont leur propre render()

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Données invalides.',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        $exceptions->dontReport(BankException::class);
    })
    ->create();
