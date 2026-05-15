<?php

namespace App\Enums;

enum OtpPurpose: string
{
    case LOGIN = 'login';
    case TRANSFER = 'transfer';
    case WITHDRAWAL = 'withdrawal';
    case RESET_PASSWORD = 'reset_password';
    case EMAIL_VERIFICATION = 'email_verification';
}
