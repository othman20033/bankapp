<?php

namespace App\Models;

use App\Enums\AccountStatus;
use App\Enums\AccountType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'account_number',
        'type',
        'balance',
        'currency',
        'status',
        'opened_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2', // string en PHP → précision conservée
            'type' => AccountType::class,
            'status' => AccountStatus::class,
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    // ───── Relations ─────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Transactions où ce compte est la source (retraits, virements émis). */
    public function outgoingTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'source_account_id');
    }

    /** Transactions où ce compte est la cible (dépôts, virements reçus). */
    public function incomingTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'target_account_id');
    }

    // ───── Scopes ─────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', AccountStatus::ACTIVE);
    }

    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    // ───── Helpers métier ─────

    public function isActive(): bool
    {
        return $this->status === AccountStatus::ACTIVE;
    }

    public function isBlocked(): bool
    {
        return $this->status === AccountStatus::BLOCKED;
    }

    /**
     * Vérifie si le compte peut être débité du montant donné.
     * Comparaison via bccomp pour préserver la précision décimale.
     */
    public function canDebit(string|float $amount): bool
    {
        if (! $this->isActive()) {
            return false;
        }

        return bccomp((string) $this->balance, (string) $amount, 2) >= 0;
    }
}
