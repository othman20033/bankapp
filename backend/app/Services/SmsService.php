<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class SmsService
{
    private ?Client $client = null;

    public function __construct()
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');

        if ($sid && $token) {
            $this->client = new Client($sid, $token);
        }
    }

    /**
     * Envoie un SMS via Twilio. En l'absence de credentials → log en dev.
     */
    public function send(string $to, string $message): void
    {
        if (! $this->client) {
            Log::info('[SMS DEV MODE]', ['to' => $to, 'message' => $message]);
            return;
        }

        $this->client->messages->create($to, [
            'from' => config('services.twilio.from'),
            'body' => $message,
        ]);
    }
}
