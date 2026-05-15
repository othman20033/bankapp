<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserAdminController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    public function index(Request $request): ResourceCollection
    {
        $query = User::query()
            ->withCount('accounts')
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%' . $request->input('search') . '%';
                $q->where(function ($qq) use ($term) {
                    $qq->where('first_name', 'like', $term)
                        ->orWhere('last_name', 'like', $term)
                        ->orWhere('email', 'like', $term);
                });
            })
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->input('role')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest();

        return UserResource::collection($query->paginate(15));
    }

    public function show(User $user): UserResource
    {
        return new UserResource($user->load('accounts'));
    }

    public function updateStatus(Request $request, User $user): UserResource
    {
        $data = $request->validate([
            'status' => ['required', 'in:active,suspended'],
        ]);

        $old = $user->only(['status']);
        $user->update(['status' => UserStatus::from($data['status'])]);

        $this->audit->log('admin.user.status_changed', $user, $old, $data);

        return new UserResource($user->fresh());
    }
}
