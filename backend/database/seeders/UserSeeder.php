<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ───── Admin par défaut ─────
        User::factory()->admin()->create([
            'first_name' => 'Admin',
            'last_name' => 'BankApp',
            'email' => 'admin@bankapp.test',
            'password' => Hash::make('Admin@2026'),
            'phone' => '+212600000000',
        ]);

        // ───── Client de démo ─────
        User::factory()->create([
            'first_name' => 'Othmane',
            'last_name' => 'Demo',
            'email' => 'client@bankapp.test',
            'password' => Hash::make('Client@2026'),
            'phone' => '+212611111111',
        ]);

        // ───── 20 clients fictifs ─────
        User::factory()
            ->count(20)
            ->state(['role' => UserRole::CLIENT])
            ->create();
    }
}
