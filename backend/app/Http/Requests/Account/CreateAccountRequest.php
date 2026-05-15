<?php

namespace App\Http\Requests\Account;

use App\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(AccountType::class)],
            'initial_deposit' => [
                'nullable',
                'numeric',
                'min:' . config('bankapp.account.min_initial_deposit', 0),
            ],
        ];
    }
}
