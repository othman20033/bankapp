<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'amount' => (string) $this->amount,
            'currency' => $this->currency,
            'status' => $this->status->value,
            'description' => $this->description,
            'balance_before' => (string) $this->balance_before,
            'balance_after' => (string) $this->balance_after,
            'source_account' => $this->whenLoaded(
                'sourceAccount',
                fn () => $this->sourceAccount
                    ? [
                        'id' => $this->sourceAccount->id,
                        'account_number' => $this->sourceAccount->account_number,
                    ]
                    : null,
            ),
            'target_account' => $this->whenLoaded(
                'targetAccount',
                fn () => $this->targetAccount
                    ? [
                        'id' => $this->targetAccount->id,
                        'account_number' => $this->targetAccount->account_number,
                    ]
                    : null,
            ),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
