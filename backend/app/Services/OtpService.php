<?php

namespace App\Services;

use App\Enums\OtpPurpose;
use App\Exceptions\InvalidOtpException;
use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    public function __construct(private readonly SmsService $sms) {}

    /**
     * Génère un OTP, le hash en BDD, l'envoie par email ET/OU SMS,
     * et retourne l'enregistrement (sans le code en clair).
     *
     * @param  array  $channels  ['email', 'sms'] — au moins un
     */
    public function send(
        User $user,
        OtpPurpose $purpose,
        array $channels = ['email'],
        ?array $metadata = null,
    ): OtpCode {
        $code = $this->generateCode();
        $expiry = (int) config('bankapp.otp.expiry_minutes', 5);

        // Invalider les OTP précédents non utilisés du même purpose
        OtpCode::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $otp = OtpCode::create([
            'user_id' => $user->id,
            'code_hash' => Hash::make($code),
            'purpose' => $purpose,
            'channel' => $channels[0], // canal principal pour log
            'expires_at' => now()->addMinutes($expiry),
            'metadata' => $metadata,
        ]);

        // ───── Envoi multi-canal ─────
        if (in_array('email', $channels, true)) {
            $this->sendByEmail($user, $code, $purpose);
        }

        if (in_array('sms', $channels, true) && $user->phone) {
            $this->sendBySms($user, $code, $purpose);
        }

        return $otp;
    }

    /**
     * Vérifie un OTP en associant code + purpose + utilisateur.
     * Marque l'OTP comme utilisé si valide.
     *
     * @throws InvalidOtpException
     */
    public function verify(User $user, OtpPurpose $purpose, string $code): OtpCode
    {
        $otp = OtpCode::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->valid()
            ->latest()
            ->first();

        if (! $otp || ! $otp->verify($code)) {
            throw new InvalidOtpException();
        }

        $otp->markUsed();

        return $otp;
    }

    private function generateCode(): string
    {
        $length = (int) config('bankapp.otp.length', 6);
        $max = (10 ** $length) - 1;

        return str_pad((string) random_int(0, $max), $length, '0', STR_PAD_LEFT);
    }

    private function sendByEmail(User $user, string $code, OtpPurpose $purpose): void
    {
        try {
            Mail::to($user->email)->queue(new OtpMail($user, $code, $purpose));
        } catch (\Throwable $e) {
            Log::error('OTP email failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }
    }

    private function sendBySms(User $user, string $code, OtpPurpose $purpose): void
    {
        $message = "BankApp : votre code de sécurité est {$code}. Valable "
            . config('bankapp.otp.expiry_minutes') . " minutes. Ne le partagez jamais.";

        try {
            $this->sms->send($user->phone, $message);
        } catch (\Throwable $e) {
            Log::error('OTP SMS failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }
    }
}
