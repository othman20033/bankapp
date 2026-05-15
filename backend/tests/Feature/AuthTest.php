<?php

use App\Models\User;

it('registers a new client', function () {
    // example.net resolves in DNS (RFC 2606 reserved domain) — passes email:rfc,dns
    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@example.net',
        'password' => 'Str0ng!Pass#2026',
        'password_confirmation' => 'Str0ng!Pass#2026',
    ]);

    // AuthController wraps Resource in response()->json([...]) → flat structure
    $response->assertCreated()
        ->assertJsonStructure(['user' => ['id', 'email', 'role'], 'token']);
});

it('logs in an existing user', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'Password123!',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['user', 'token']);
});

it('rejects login with wrong password', function () {
    $user = User::factory()->create();

    $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'WrongPassword',
    ])->assertStatus(422);
});

it('returns the authenticated user via /auth/me', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $this->withHeader('Authorization', "Bearer $token")
        ->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.email', $user->email);
});
