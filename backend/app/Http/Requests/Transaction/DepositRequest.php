<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class DepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['required', 'integer', 'exists:accounts,id'],
            'amount' => [
                'required',
                'numeric',
                'min:' . config('bankapp.deposit.min_amount'),
                'max:' . config('bankapp.deposit.max_amount'),
            ],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
