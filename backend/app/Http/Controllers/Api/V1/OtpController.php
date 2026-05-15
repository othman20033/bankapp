<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OtpPurpose;
use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OtpController extends Controller
{
    public function __construct(private readonly OtpService $otp) {}

    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'purpose' => ['required', 'string'],
            'channels' => ['nullable', 'array'],
            'channels.*' => ['in:email,sms'],
        ]);

        $purpose = OtpPurpose::from($data['purpose']);
        $channels = $data['channels'] ?? ['email'];

        $otp = $this->otp->send($request->user(), $purpose, $channels);

        return response()->json([
            'otp_id' => $otp->id,
            'expires_at' => $otp->expires_at->toIso8601String(),
            'channels' => $channels,
        ]);
    }

    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate([
            'purpose' => ['required', 'string'],
            'code' => ['required', 'string', 'digits:6'],
        ]);

        $this->otp->verify($request->user(), OtpPurpose::from($data['purpose']), $data['code']);

        return response()->json(['verified' => true]);
    }
}
