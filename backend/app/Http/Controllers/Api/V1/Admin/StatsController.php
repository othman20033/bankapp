<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\AccountStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    /**
     * Statistiques globales pour le dashboard admin.
     */
    public function overview(): JsonResponse
    {
        $totalUsers = User::where('role', UserRole::CLIENT)->count();
        $activeAccounts = Account::where('status', AccountStatus::ACTIVE)->count();
        $blockedAccounts = Account::where('status', AccountStatus::BLOCKED)->count();
        $totalBalance = Account::sum('balance');

        $todayTxCount = Transaction::whereDate('created_at', today())->count();
        $todayTxVolume = Transaction::whereDate('created_at', today())
            ->where('status', TransactionStatus::COMPLETED)
            ->sum('amount');

        // Évolution journalière sur 30 jours
        $daily = Transaction::query()
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(amount) as volume'),
            )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Répartition par type
        $byType = Transaction::query()
            ->select('type', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as volume'))
            ->whereDate('created_at', '>=', now()->subDays(30))
            ->groupBy('type')
            ->get()
            ->mapWithKeys(fn ($row) => [
                $row->type instanceof TransactionType ? $row->type->value : $row->type => [
                    'count' => (int) $row->count,
                    'volume' => (string) $row->volume,
                ],
            ]);

        return response()->json([
            'totals' => [
                'clients' => $totalUsers,
                'active_accounts' => $activeAccounts,
                'blocked_accounts' => $blockedAccounts,
                'total_balance' => (string) $totalBalance,
                'currency' => config('bankapp.currency'),
            ],
            'today' => [
                'transactions_count' => $todayTxCount,
                'volume' => (string) $todayTxVolume,
            ],
            'daily_evolution' => $daily,
            'by_type' => $byType,
        ]);
    }
}
