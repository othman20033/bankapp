<?php

namespace Database\Factories;

use App\Enums\AccountStatus;
use App\Enums\AccountType;
use App\Models\Account;
use App\Models\User;
use App\Support\IbanGenerator;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'account_number' => IbanGenerator::generate(),
            'type' => fake()->randomElement(AccountType::cases()),
            'balance' => fake()->randomFloat(2, 100, 100000),
            'currency' => 'MAD',
            'status' => AccountStatus::ACTIVE,
            'opened_at' => fake()->dateTimeBetween('-2 years', 'now'),
        ];
    }

    public function checking(): static
    {
        return $this->state(fn () => ['type' => AccountType::CHECKING]);
    }

    public function savings(): static
    {
        return $this->state(fn () => ['type' => AccountType::SAVINGS]);
    }

    public function blocked(): static
    {
        return $this->state(fn () => ['status' => AccountStatus::BLOCKED]);
    }

    public function withBalance(string|float $amount): static
    {
        return $this->state(fn () => ['balance' => $amount]);
    }
}
