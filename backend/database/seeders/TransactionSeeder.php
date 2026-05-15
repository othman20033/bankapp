<?php

namespace Database\Seeders;

use App\Enums\AccountStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Transaction;
use App\Support\IbanGenerator;
use Illuminate\Database\Seeder;

/**
 * Génère un historique de transactions réaliste pour le seed.
 * ⚠️ N'utilise PAS le TransactionService — c'est du seed,
 * on inscrit directement des transactions cohérentes avec les soldes existants.
 */
class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = Account::where('status', AccountStatus::ACTIVE)->get();

        foreach ($accounts as $account) {
            // 5 à 15 transactions par compte sur les 6 derniers mois
            $count = fake()->numberBetween(5, 15);
            $runningBalance = (float) $account->balance;

            for ($i = 0; $i < $count; $i++) {
                $type = fake()->randomElement([
                    TransactionType::DEPOSIT,
                    TransactionType::WITHDRAWAL,
                    TransactionType::TRANSFER,
                ]);
                $amount = fake()->randomFloat(2, 50, 2000);

                if ($type === TransactionType::DEPOSIT) {
                    $balanceBefore = $runningBalance;
                    $runningBalance += $amount;
                    Transaction::create([
                        'reference' => IbanGenerator::generateTransactionReference(),
                        'type' => $type,
                        'source_account_id' => null,
                        'target_account_id' => $account->id,
                        'amount' => $amount,
                        'currency' => 'MAD',
                        'balance_before' => $balanceBefore,
                        'balance_after' => $runningBalance,
                        'status' => TransactionStatus::COMPLETED,
                        'description' => fake()->randomElement([
                            'Dépôt espèces guichet',
                            'Virement reçu salaire',
                            'Remboursement',
                        ]),
                        'performed_by' => $account->user_id,
                        'created_at' => fake()->dateTimeBetween('-6 months', 'now'),
                    ]);
                } elseif ($runningBalance >= $amount) {
                    $balanceBefore = $runningBalance;
                    $runningBalance -= $amount;
                    Transaction::create([
                        'reference' => IbanGenerator::generateTransactionReference(),
                        'type' => $type,
                        'source_account_id' => $account->id,
                        'target_account_id' => $type === TransactionType::TRANSFER
                            ? optional($accounts->where('id', '!=', $account->id)->random())->id
                            : null,
                        'amount' => $amount,
                        'currency' => 'MAD',
                        'balance_before' => $balanceBefore,
                        'balance_after' => $runningBalance,
                        'status' => TransactionStatus::COMPLETED,
                        'description' => fake()->randomElement([
                            'Retrait DAB',
                            'Achat carte',
                            'Virement émis',
                            'Facture',
                        ]),
                        'performed_by' => $account->user_id,
                        'created_at' => fake()->dateTimeBetween('-6 months', 'now'),
                    ]);
                }
            }

            // Synchroniser le solde du compte avec le solde calculé
            $account->update(['balance' => $runningBalance]);
        }
    }
}
