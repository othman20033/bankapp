<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class AccountAdminController extends Controller
{
    public function __construct(private readonly AccountService $accounts) {}

    public function index(Request $request): ResourceCollection
    {
        $query = Account::query()
            ->with('user')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('search'), fn ($q) => $q->where('account_number', 'like', '%' . $request->input('search') . '%'))
            ->latest();

        return AccountResource::collection($query->paginate(20));
    }

    public function block(Request $request, Account $account): AccountResource
    {
        $reason = $request->input('reason', '');
        return new AccountResource($this->accounts->block($account, $reason));
    }

    public function activate(Account $account): AccountResource
    {
        return new AccountResource($this->accounts->activate($account));
    }
}
