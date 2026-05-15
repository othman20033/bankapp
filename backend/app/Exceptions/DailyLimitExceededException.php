<?php

namespace App\Exceptions;

class DailyLimitExceededException extends BankException
{
    protected int $statusCode = 422;
    protected string $errorKey = 'bank.daily_limit_exceeded';

    public function __construct(string $message = 'Plafond journalier dépassé.')
    {
        parent::__construct($message);
    }
}
