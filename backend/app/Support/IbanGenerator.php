<?php

namespace App\Support;

use App\Models\Account;

/**
 * Génère un numéro de compte unique au format simplifié IBAN :
 *   BK + 2 chiffres pays (MA = 64) + 16 chiffres aléatoires
 * Exemple : BK64 1234 5678 9012 3456
 *
 * En prod réelle on calculerait la clé de contrôle modulo 97
 * conformément à la norme ISO 13616 — ici simplifié pour le projet.
 */
class IbanGenerator
{
    private const COUNTRY_CODE = 'MA'; // Maroc
    private const COUNTRY_DIGITS = '64'; // Maroc selon ISO 13616
    private const PREFIX = 'BK';

    public static function generate(): string
    {
        do {
            $body = self::generateRandomDigits(16);
            $accountNumber = self::PREFIX . self::COUNTRY_DIGITS . $body;
        } while (Account::where('account_number', $accountNumber)->exists());

        return $accountNumber;
    }

    public static function format(string $accountNumber): string
    {
        // BK6412345678901234567890 → BK64 1234 5678 9012 3456 7890
        return trim(chunk_split($accountNumber, 4, ' '));
    }

    private static function generateRandomDigits(int $length): string
    {
        $digits = '';
        for ($i = 0; $i < $length; $i++) {
            $digits .= random_int(0, 9);
        }

        return $digits;
    }

    public static function generateTransactionReference(): string
    {
        return sprintf(
            'TXN-%s-%s',
            now()->format('Ymd'),
            strtoupper(bin2hex(random_bytes(4))) // 8 chars hex
        );
    }
}
