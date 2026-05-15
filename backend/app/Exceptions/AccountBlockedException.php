<?php

namespace App\Exceptions;

class AccountBlockedException extends BankException
{
    protected int $statusCode = 423; // Locked
    protected string $errorKey = 'bank.account_blocked';

    public function __construct(string $message = 'Ce compte est bloqué ou inactif.')
    {
        parent::__construct($message);
    }
}
