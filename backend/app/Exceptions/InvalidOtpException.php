<?php

namespace App\Exceptions;

class InvalidOtpException extends BankException
{
    protected int $statusCode = 401;
    protected string $errorKey = 'bank.invalid_otp';

    public function __construct(string $message = 'Code OTP invalide, expiré ou déjà utilisé.')
    {
        parent::__construct($message);
    }
}
