<?php

namespace App\Services;

use App\Enums\AccountStatus;
use App\Enums\AccountType;
use App\Models\Account;
use App\Models\User;
use App\Support\IbanGenerator;
use Illuminate\Support\Facades\DB;

class AccountService
{
    public function __construct(private readonly AuditService $audit) {}

    /**
     * Crée un nouveau compte bancaire pour l'utilisateur.
     * Optionnellement crédité d'un dépôt initial.
     */
    public function create(User $user, AccountType $type, float $initialDeposit = 0): Account
    {
        return DB::transaction(function () use ($user, $type, $initialDeposit) {
            $account = Account::create([
                'user_id' => $user->id,
                'account_number' => IbanGenerator::generate(),
                'type' => $type,
                'balance' => $initialDeposit,
                'currency' => config('bankapp.currency'),
                'status' => AccountStatus::ACTIVE,
                'opened_at' => now(),
            ]);

            $this->audit->log('account.created', $account, null, $account->toArray());

            return $account;
        });
    }

    public function block(Account $account, string $reason = ''): Account
    {
        $old = $account->only(['status']);
        $account->update(['status' => AccountStatus::BLOCKED]);

        $this->audit->log(
            'account.blocked',
            $account,
            $old,
            ['status' => AccountStatus::BLOCKED->value, 'reason' => $reason],
        );

        return $account->fresh();
    }

    public function activate(Account $account): Account
    {
        $old = $account->only(['status']);
        $account->update(['status' => AccountStatus::ACTIVE]);

        $this->audit->log('account.activated', $account, $old, $account->only(['status']));

        return $account->fresh();
    }

    public function close(Account $account): Account
    {
        if (bccomp((string) $account->balance, '0', 2) !== 0) {
            throw new \DomainException('Le compte doit avoir un solde nul avant clôture.');
        }

        $account->update([
            'status' => AccountStatus::CLOSED,
            'closed_at' => now(),
        ]);

        $this->audit->log('account.closed', $account);

        return $account->fresh();
    }
}
