<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\CreateAccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AccountController extends Controller
{
    public function __construct(private readonly AccountService $accounts) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $accounts = Account::ownedBy($request->user()->id)
            ->orderByDesc('opened_at')
            ->get();

        return AccountResource::collection($accounts);
    }

    public function store(CreateAccountRequest $request): JsonResponse
    {
        $account = $this->accounts->create(
            user: $request->user(),
            type: $request->enum('type', \App\Enums\AccountType::class),
            initialDeposit: (float) $request->input('initial_deposit', 0),
        );

        return (new AccountResource($account))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Account $account): AccountResource
    {
        $this->authorize('view', $account);

        return new AccountResource($account->load('user'));
    }

    public function balance(Request $request, Account $account): JsonResponse
    {
        $this->authorize('view', $account);

        return response()->json([
            'account_id' => $account->id,
            'balance' => (string) $account->balance,
            'currency' => $account->currency,
            'as_of' => now()->toIso8601String(),
        ]);
    }
}
