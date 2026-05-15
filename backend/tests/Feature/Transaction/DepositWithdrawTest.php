<?php

use App\Enums\TransactionType;
use App\Exceptions\InsufficientFundsException;
use App\Models\Account;
use App\Models\User;
use App\Services\TransactionService;
use Illuminate\Support\Facades\Auth;

beforeEach(function () {
    $this->service = app(TransactionService::class);
    $this->user = User::factory()->create();
    Auth::login($this->user);
});

it('deposits money and increases the account balance', function () {
    $account = Account::factory()->withBalance(100)->for($this->user)->create();

    $tx = $this->service->deposit($account, 250.50, 'Salaire');

    expect($tx->type)->toBe(TransactionType::DEPOSIT)
        ->and((string) $account->fresh()->balance)->toBe('350.50')
        ->and((string) $tx->balance_after)->toBe('350.50');
});

it('withdraws money and decreases the account balance', function () {
    $account = Account::factory()->withBalance(1000)->for($this->user)->create();

    $tx = $this->service->withdraw($account, 250);

    expect($tx->type)->toBe(TransactionType::WITHDRAWAL)
        ->and((string) $account->fresh()->balance)->toBe('750.00');
});

it('refuses withdrawal exceeding balance', function () {
    $account = Account::factory()->withBalance(50)->for($this->user)->create();

    $this->service->withdraw($account, 100);
})->throws(InsufficientFundsException::class);

it('throws when modifying a transaction (immutability)', function () {
    $account = Account::factory()->withBalance(1000)->for($this->user)->create();
    $tx = $this->service->deposit($account, 100);

    $tx->amount = 999;
    $tx->save();
})->throws(LogicException::class, 'Les transactions sont immuables');
