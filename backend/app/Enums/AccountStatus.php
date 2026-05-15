<?php

namespace App\Enums;

enum AccountStatus: string
{
    case ACTIVE = 'active';
    case BLOCKED = 'blocked';
    case CLOSED = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Actif',
            self::BLOCKED => 'Bloqué',
            self::CLOSED => 'Clôturé',
        };
    }

    public function canTransact(): bool
    {
        return $this === self::ACTIVE;
    }
}
