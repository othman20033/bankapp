<?php

return [
    /*
    |--------------------------------------------------------------------------
    | BankApp — configuration métier
    |--------------------------------------------------------------------------
    | Centralise les seuils, limites et règles bancaires.
    | Modifiable via .env sans redéployer.
    */

    'currency' => env('BANK_DEFAULT_CURRENCY', 'MAD'),

    'transfer' => [
        'otp_threshold' => (float) env('BANK_TRANSFER_OTP_THRESHOLD', 1000),
        'daily_limit' => (float) env('BANK_DAILY_TRANSFER_LIMIT', 50000),
        'min_amount' => 0.01,
        'max_amount' => 100000.00,
    ],

    'withdrawal' => [
        'min_amount' => 0.01,
        'max_amount' => 20000.00,
        'daily_limit' => 10000.00,
    ],

    'deposit' => [
        'min_amount' => 0.01,
        'max_amount' => 1000000.00,
    ],

    'otp' => [
        'length' => 6,
        'expiry_minutes' => (int) env('BANK_OTP_EXPIRY_MINUTES', 5),
        'max_attempts' => (int) env('BANK_MAX_OTP_ATTEMPTS', 5),
    ],

    'account' => [
        'min_initial_deposit' => 100.00,
    ],
];
