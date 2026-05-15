<?php

namespace Database\Factories;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Support\IbanGenerator;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $amount = fake()->randomFloat(2, 10, 5000);
        $balanceBefore = fake()->randomFloat(2, 1000, 50000);

        return [
            'reference' => IbanGenerator::generateTransactionReference(),
            'type' => TransactionType::DEPOSIT,
            'source_account_id' => null,
            'target_account_id' => Account::factory(),
            'amount' => $amount,
            'currency' => 'MAD',
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceBefore + $amount,
            'status' => TransactionStatus::COMPLETED,
            'description' => fake()->optional()->sentence(),
            'metadata' => null,
            'performed_by' => User::factory(),
            'created_at' => fake()->dateTimeBetween('-6 months', 'now'),
        ];
    }

    public function deposit(?Account $target = null, string|float $amount = 1000): static
    {
        return $this->state(function () use ($target, $amount) {
            $balanceBefore = $target?->balance ?? 0;
            return [
                'type' => TransactionType::DEPOSIT,
                'source_account_id' => null,
                'target_account_id' => $target?->id ?? Account::factory(),
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => bcadd((string) $balanceBefore, (string) $amount, 2),
            ];
        });
    }

    public function withdrawal(?Account $source = null, string|float $amount = 500): static
    {
        return $this->state(function () use ($source, $amount) {
            $balanceBefore = $source?->balance ?? 10000;
            return [
                'type' => TransactionType::WITHDRAWAL,
                'source_account_id' => $source?->id ?? Account::factory(),
                'target_account_id' => null,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => bcsub((string) $balanceBefore, (string) $amount, 2),
            ];
        });
    }

    public function transfer(Account $source, Account $target, string|float $amount = 200): static
    {
        return $this->state(fn () => [
            'type' => TransactionType::TRANSFER,
            'source_account_id' => $source->id,
            'target_account_id' => $target->id,
            'amount' => $amount,
            'balance_before' => $source->balance,
            'balance_after' => bcsub((string) $source->balance, (string) $amount, 2),
        ]);
    }
}
