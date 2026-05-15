<?php

namespace App\Http\Resources;

use App\Support\IbanGenerator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'account_number' => $this->account_number,
            'account_number_formatted' => IbanGenerator::format($this->account_number),
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'balance' => (string) $this->balance,
            'currency' => $this->currency,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'opened_at' => $this->opened_at?->toIso8601String(),
            'closed_at' => $this->closed_at?->toIso8601String(),
            'owner' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
