<?php

namespace App\Mail;

use App\Enums\OtpPurpose;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly string $code,
        public readonly OtpPurpose $purpose,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'BankApp — Votre code de sécurité');
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
            with: [
                'user' => $this->user,
                'code' => $this->code,
                'purposeLabel' => $this->purposeLabel(),
                'expiry' => config('bankapp.otp.expiry_minutes', 5),
            ],
        );
    }

    private function purposeLabel(): string
    {
        return match ($this->purpose) {
            OtpPurpose::LOGIN => 'connexion',
            OtpPurpose::TRANSFER => 'virement bancaire',
            OtpPurpose::WITHDRAWAL => 'retrait',
            OtpPurpose::RESET_PASSWORD => 'réinitialisation du mot de passe',
            OtpPurpose::EMAIL_VERIFICATION => 'vérification de votre email',
        };
    }
}
