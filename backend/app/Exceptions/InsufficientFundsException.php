<?php

namespace App\Exceptions;

class InsufficientFundsException extends BankException
{
    protected int $statusCode = 422;
    protected string $errorKey = 'bank.insufficient_funds';

    public function __construct(string $message = 'Solde insuffisant pour effectuer cette opération.')
    {
        parent::__construct($message);
    }
}
