<?php

namespace App\Models;

use App\Enums\OtpPurpose;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Hash;

class OtpCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'code_hash',
        'purpose',
        'channel',
        'attempts',
        'expires_at',
        'used_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'purpose' => OtpPurpose::class,
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
            'metadata' => 'array',
            'attempts' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ───── Scopes ─────

    public function scopeValid(Builder $query): Builder
    {
        return $query->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->where('attempts', '<', 5);
    }

    // ───── Helpers ─────

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isUsed(): bool
    {
        return ! is_null($this->used_at);
    }

    public function tooManyAttempts(): bool
    {
        return $this->attempts >= 5;
    }

    public function verify(string $code): bool
    {
        $this->increment('attempts');

        if ($this->isExpired() || $this->isUsed() || $this->tooManyAttempts()) {
            return false;
        }

        return Hash::check($code, $this->code_hash);
    }

    public function markUsed(): void
    {
        $this->update(['used_at' => now()]);
    }
}
