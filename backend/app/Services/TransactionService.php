<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Exceptions\AccountBlockedException;
use App\Exceptions\DailyLimitExceededException;
use App\Exceptions\InsufficientFundsException;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Support\IbanGenerator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Service cœur métier des opérations bancaires.
 *
 * Garanties critiques :
 *  - Chaque opération est ATOMIQUE (DB::transaction)
 *  - Verrou pessimiste lockForUpdate() sur les comptes pour éviter
 *    les conditions de concurrence (double-spending)
 *  - Solde JAMAIS négatif (vérifié sous verrou)
 *  - Arithmétique décimale via bcadd/bcsub (jamais de float)
 *  - Snapshots balance_before / balance_after figés pour audit
 *  - Reference unique par transaction
 */
class TransactionService
{
    public function __construct(
        private readonly AuditService $audit,
    ) {}

    // ──────────────────────────────────────────────────────────────
    // DÉPÔT
    // ──────────────────────────────────────────────────────────────

    public function deposit(
        Account $account,
        string|float $amount,
        ?string $description = null,
        ?User $performer = null,
    ): Transaction {
        $amount = $this->normalizeAmount($amount);
        $this->ensureAmountInRange($amount, config('bankapp.deposit'));

        return DB::transaction(function () use ($account, $amount, $description, $performer) {
            $locked = Account::lockForUpdate()->findOrFail($account->id);
            $this->ensureAccountActive($locked);

            $balanceBefore = (string) $locked->balance;
            $balanceAfter = bcadd($balanceBefore, $amount, 2);

            $locked->update(['balance' => $balanceAfter]);

            $tx = Transaction::create([
                'reference' => IbanGenerator::generateTransactionReference(),
                'type' => TransactionType::DEPOSIT,
                'source_account_id' => null,
                'target_account_id' => $locked->id,
                'amount' => $amount,
                'currency' => $locked->currency,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'status' => TransactionStatus::COMPLETED,
                'description' => $description,
                'performed_by' => ($performer ?? Auth::user())->id,
            ]);

            $this->audit->log('transaction.deposit.completed', $tx);

            return $tx;
        });
    }

    // ──────────────────────────────────────────────────────────────
    // RETRAIT
    // ──────────────────────────────────────────────────────────────

    public function withdraw(
        Account $account,
        string|float $amount,
        ?string $description = null,
    ): Transaction {
        $amount = $this->normalizeAmount($amount);
        $this->ensureAmountInRange($amount, config('bankapp.withdrawal'));

        return DB::transaction(function () use ($account, $amount, $description) {
            $locked = Account::lockForUpdate()->findOrFail($account->id);
            $this->ensureAccountActive($locked);
            $this->ensureSufficientFunds($locked, $amount);
            $this->ensureDailyLimit($locked, $amount, TransactionType::WITHDRAWAL);

            $balanceBefore = (string) $locked->balance;
            $balanceAfter = bcsub($balanceBefore, $amount, 2);

            $locked->update(['balance' => $balanceAfter]);

            $tx = Transaction::create([
                'reference' => IbanGenerator::generateTransactionReference(),
                'type' => TransactionType::WITHDRAWAL,
                'source_account_id' => $locked->id,
                'target_account_id' => null,
                'amount' => $amount,
                'currency' => $locked->currency,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'status' => TransactionStatus::COMPLETED,
                'description' => $description,
                'performed_by' => Auth::id(),
            ]);

            $this->audit->log('transaction.withdrawal.completed', $tx);

            return $tx;
        });
    }

    // ──────────────────────────────────────────────────────────────
    // VIREMENT (le plus critique : 2 comptes verrouillés)
    // ──────────────────────────────────────────────────────────────

    public function transfer(
        Account $source,
        Account $target,
        string|float $amount,
        ?string $description = null,
    ): Transaction {
        $amount = $this->normalizeAmount($amount);
        $this->ensureAmountInRange($amount, config('bankapp.transfer'));

        if ($source->id === $target->id) {
            throw new \DomainException('Le compte source et destinataire doivent être différents.');
        }

        return DB::transaction(function () use ($source, $target, $amount, $description) {
            // ⚠️ Verrouiller TOUJOURS dans le même ordre (par id croissant)
            // pour éviter les deadlocks entre deux virements croisés simultanés.
            $ids = collect([$source->id, $target->id])->sort()->values();

            $locked = Account::lockForUpdate()
                ->whereIn('id', $ids)
                ->get()
                ->keyBy('id');

            $src = $locked->get($source->id);
            $tgt = $locked->get($target->id);

            $this->ensureAccountActive($src);
            $this->ensureAccountActive($tgt);
            $this->ensureSufficientFunds($src, $amount);
            $this->ensureDailyLimit($src, $amount, TransactionType::TRANSFER);

            $srcBefore = (string) $src->balance;
            $srcAfter = bcsub($srcBefore, $amount, 2);
            $tgtBefore = (string) $tgt->balance;
            $tgtAfter = bcadd($tgtBefore, $amount, 2);

            $src->update(['balance' => $srcAfter]);
            $tgt->update(['balance' => $tgtAfter]);

            $tx = Transaction::create([
                'reference' => IbanGenerator::generateTransactionReference(),
                'type' => TransactionType::TRANSFER,
                'source_account_id' => $src->id,
                'target_account_id' => $tgt->id,
                'amount' => $amount,
                'currency' => $src->currency,
                'balance_before' => $srcBefore,
                'balance_after' => $srcAfter,
                'status' => TransactionStatus::COMPLETED,
                'description' => $description,
                'metadata' => [
                    'target_balance_before' => $tgtBefore,
                    'target_balance_after' => $tgtAfter,
                ],
                'performed_by' => Auth::id(),
            ]);

            $this->audit->log('transaction.transfer.completed', $tx);

            return $tx;
        });
    }

    // ──────────────────────────────────────────────────────────────
    // Garde-fous privés
    // ──────────────────────────────────────────────────────────────

    private function normalizeAmount(string|float $amount): string
    {
        // Toujours en string à 2 décimales — jamais de float pour l'arithmétique
        return number_format((float) $amount, 2, '.', '');
    }

    private function ensureAmountInRange(string $amount, array $config): void
    {
        if (bccomp($amount, (string) $config['min_amount'], 2) < 0) {
            throw new \DomainException("Montant inférieur au minimum autorisé ({$config['min_amount']}).");
        }
        if (bccomp($amount, (string) $config['max_amount'], 2) > 0) {
            throw new \DomainException("Montant supérieur au maximum autorisé ({$config['max_amount']}).");
        }
    }

    private function ensureAccountActive(Account $account): void
    {
        if (! $account->isActive()) {
            throw new AccountBlockedException(
                "Le compte {$account->account_number} est {$account->status->label()}."
            );
        }
    }

    private function ensureSufficientFunds(Account $account, string $amount): void
    {
        if (bccomp((string) $account->balance, $amount, 2) < 0) {
            throw new InsufficientFundsException(
                sprintf(
                    'Solde insuffisant. Disponible : %s %s, demandé : %s %s.',
                    $account->balance, $account->currency, $amount, $account->currency
                )
            );
        }
    }

    private function ensureDailyLimit(Account $account, string $amount, TransactionType $type): void
    {
        $config = config('bankapp.' . $type->value);
        if (! isset($config['daily_limit'])) {
            return;
        }

        $todayTotal = Transaction::where('source_account_id', $account->id)
            ->where('type', $type)
            ->where('status', TransactionStatus::COMPLETED)
            ->whereDate('created_at', today())
            ->sum('amount');

        $projected = bcadd((string) $todayTotal, $amount, 2);

        if (bccomp($projected, (string) $config['daily_limit'], 2) > 0) {
            throw new DailyLimitExceededException(
                sprintf(
                    'Plafond journalier dépassé. Aujourd\'hui : %s, plafond : %s.',
                    $todayTotal, $config['daily_limit']
                )
            );
        }
    }
}
