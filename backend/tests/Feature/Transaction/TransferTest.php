<?php

use App\Enums\AccountStatus;
use App\Enums\TransactionType;
use App\Exceptions\AccountBlockedException;
use App\Exceptions\InsufficientFundsException;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Services\TransactionService;
use Illuminate\Support\Facades\Auth;

beforeEach(function () {
    $this->service = app(TransactionService::class);
    $this->user = User::factory()->create();
    Auth::login($this->user);
});

it('transfers money atomically between two accounts', function () {
    $source = Account::factory()->withBalance(1000)->for($this->user)->create();
    $target = Account::factory()->withBalance(500)->for(User::factory())->create();

    $tx = $this->service->transfer($source, $target, 200);

    expect($tx->type)->toBe(TransactionType::TRANSFER)
        ->and((string) $tx->amount)->toBe('200.00')
        ->and((string) $source->fresh()->balance)->toBe('800.00')
        ->and((string) $target->fresh()->balance)->toBe('700.00');
});

it('refuses transfer when source has insufficient funds', function () {
    $source = Account::factory()->withBalance(100)->for($this->user)->create();
    $target = Account::factory()->withBalance(0)->for(User::factory())->create();

    $this->service->transfer($source, $target, 500);
})->throws(InsufficientFundsException::class);

it('refuses transfer when source is blocked', function () {
    $source = Account::factory()
        ->withBalance(1000)
        ->blocked()
        ->for($this->user)
        ->create();
    $target = Account::factory()->for(User::factory())->create();

    $this->service->transfer($source, $target, 100);
})->throws(AccountBlockedException::class);

it('refuses transfer to the same account', function () {
    $account = Account::factory()->withBalance(1000)->for($this->user)->create();

    $this->service->transfer($account, $account, 100);
})->throws(DomainException::class);

it('keeps balances unchanged when transfer fails mid-way', function () {
    $source = Account::factory()->withBalance(100)->for($this->user)->create();
    $target = Account::factory()->withBalance(500)->for(User::factory())->create();

    try {
        $this->service->transfer($source, $target, 999); // insuffisant
    } catch (InsufficientFundsException) {
    }

    // Aucun débit ne doit avoir eu lieu (transaction rollback)
    expect((string) $source->fresh()->balance)->toBe('100.00')
        ->and((string) $target->fresh()->balance)->toBe('500.00')
        ->and(Transaction::count())->toBe(0);
});

it('records balance_before and balance_after snapshots', function () {
    $source = Account::factory()->withBalance(1000)->for($this->user)->create();
    $target = Account::factory()->withBalance(0)->for(User::factory())->create();

    $tx = $this->service->transfer($source, $target, 300);

    expect((string) $tx->balance_before)->toBe('1000.00')
        ->and((string) $tx->balance_after)->toBe('700.00');
});
