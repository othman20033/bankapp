<?php

namespace App\Policies;

use App\Models\Account;
use App\Models\User;

class AccountPolicy
{
    /**
     * L'admin peut tout voir. Un client ne voit que ses propres comptes.
     */
    public function view(User $user, Account $account): bool
    {
        return $user->isAdmin() || $account->user_id === $user->id;
    }

    public function transact(User $user, Account $account): bool
    {
        return $account->user_id === $user->id;
    }

    public function manage(User $user): bool
    {
        return $user->isAdmin();
    }
}
