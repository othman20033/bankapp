<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'role' => UserRole::CLIENT,
            'status' => UserStatus::ACTIVE,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        $this->audit->log('user.registered', $user);

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $key = 'login:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw ValidationException::withMessages([
                'email' => 'Trop de tentatives. Réessayez dans ' . RateLimiter::availableIn($key) . 's.',
            ]);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Auth::attempt($request->only('email', 'password'))) {
            RateLimiter::hit($key, 60);
            throw ValidationException::withMessages([
                'email' => 'Identifiants invalides.',
            ]);
        }

        if (! $user->isActive()) {
            throw ValidationException::withMessages([
                'email' => 'Votre compte est suspendu. Contactez le support.',
            ]);
        }

        RateLimiter::clear($key);

        $deviceName = $request->input('device_name', $request->userAgent() ?? 'unknown');
        $token = $user->createToken($deviceName)->plainTextToken;

        $this->audit->log('user.login.success', $user);

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        $this->audit->log('user.logout', $request->user());

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function updateProfile(Request $request): UserResource
    {
        $data = $request->validate([
            'first_name' => ['sometimes', 'string', 'min:2', 'max:80'],
            'last_name' => ['sometimes', 'string', 'min:2', 'max:80'],
            'phone' => ['sometimes', 'nullable', 'string', 'regex:/^\+?[0-9 ]{8,20}$/'],
        ]);

        $user = $request->user();
        $old = $user->only(array_keys($data));
        $user->update($data);

        $this->audit->log('user.profile.updated', $user, $old, $data);

        return new UserResource($user->fresh());
    }

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'Mot de passe actuel incorrect.',
            ]);
        }

        $user->update(['password' => $data['password']]);

        // Révoquer tous les autres tokens — l'utilisateur restera connecté sur l'appareil courant
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        $this->audit->log('user.password.changed', $user);

        return response()->json(['message' => 'Mot de passe modifié.']);
    }
}
