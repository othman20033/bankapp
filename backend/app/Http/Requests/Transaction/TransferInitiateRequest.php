<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class TransferInitiateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source_account_id' => ['required', 'integer', 'exists:accounts,id'],
            'target_account_number' => ['required', 'string', 'exists:accounts,account_number'],
            'amount' => [
                'required',
                'numeric',
                'min:' . config('bankapp.transfer.min_amount'),
                'max:' . config('bankapp.transfer.max_amount'),
            ],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
