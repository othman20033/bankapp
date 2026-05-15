<?php

namespace App\Enums;

enum AccountType: string
{
    case CHECKING = 'checking';
    case SAVINGS = 'savings';

    public function label(): string
    {
        return match ($this) {
            self::CHECKING => 'Compte courant',
            self::SAVINGS => 'Compte épargne',
        };
    }
}
