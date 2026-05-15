<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    public function run(): void
    {
        $clients = User::where('role', UserRole::CLIENT)->get();

        foreach ($clients as $client) {
            // Chaque client : 1 compte courant (obligatoire)
            Account::factory()
                ->checking()
                ->withBalance(fake()->randomFloat(2, 5000, 50000))
                ->for($client)
                ->create();

            // 50% des clients : un compte épargne en plus
            if (fake()->boolean(50)) {
                Account::factory()
                    ->savings()
                    ->withBalance(fake()->randomFloat(2, 1000, 200000))
                    ->for($client)
                    ->create();
            }
        }

        // Compte spécifique au client démo
        $demoClient = User::where('email', 'client@bankapp.test')->first();
        if ($demoClient && $demoClient->accounts()->count() === 0) {
            Account::factory()
                ->checking()
                ->withBalance(25000)
                ->for($demoClient)
                ->create();
        }
    }
}
