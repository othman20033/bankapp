<?php

use App\Http\Controllers\Api\V1\AccountController;
use App\Http\Controllers\Api\V1\Admin\AccountAdminController;
use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\StatsController;
use App\Http\Controllers\Api\V1\Admin\UserAdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\OtpController;
use App\Http\Controllers\Api\V1\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| BankApp — API REST v1
|--------------------------------------------------------------------------
| Préfixe global : /api/v1
| Toutes les routes (sauf register/login) requièrent auth:sanctum.
| Throttling global : 60 req/min utilisateur.
*/

Route::prefix('v1')->group(function () {

    // ───── Public ─────
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    // ───── Authenticated ─────
    Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {

        // Auth
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::put('auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('auth/password', [AuthController::class, 'changePassword']);

        // OTP
        Route::post('otp/send', [OtpController::class, 'send'])->middleware('throttle:3,1');
        Route::post('otp/verify', [OtpController::class, 'verify']);

        // Comptes (client)
        Route::get('accounts', [AccountController::class, 'index']);
        Route::post('accounts', [AccountController::class, 'store']);
        Route::get('accounts/{account}', [AccountController::class, 'show']);
        Route::get('accounts/{account}/balance', [AccountController::class, 'balance']);

        // Transactions (client)
        Route::get('transactions', [TransactionController::class, 'index']);
        Route::get('transactions/export/pdf', [TransactionController::class, 'exportPdf']);
        Route::get('transactions/{transaction}', [TransactionController::class, 'show']);
        Route::post('transactions/deposit', [TransactionController::class, 'deposit']);
        Route::post('transactions/withdraw', [TransactionController::class, 'withdraw']);
        Route::post('transactions/transfer/initiate', [TransactionController::class, 'initiateTransfer']);
        Route::post('transactions/transfer/confirm', [TransactionController::class, 'confirmTransfer']);

        // ───── Admin ─────
        Route::prefix('admin')->middleware('role:admin')->group(function () {
            Route::get('users', [UserAdminController::class, 'index']);
            Route::get('users/{user}', [UserAdminController::class, 'show']);
            Route::patch('users/{user}/status', [UserAdminController::class, 'updateStatus']);

            Route::get('accounts', [AccountAdminController::class, 'index']);
            Route::patch('accounts/{account}/block', [AccountAdminController::class, 'block']);
            Route::patch('accounts/{account}/activate', [AccountAdminController::class, 'activate']);

            Route::get('stats/overview', [StatsController::class, 'overview']);
            Route::get('audit-logs', [AuditLogController::class, 'index']);
        });
    });
});

// Healthcheck (publique)
Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'service' => 'bankapp-api',
    'timestamp' => now()->toIso8601String(),
]));
