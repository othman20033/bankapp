<?php

namespace App\Models;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Transaction = enregistrement IMMUTABLE.
 * Le modèle bloque save() après création pour garantir l'intégrité de l'audit.
 */
class Transaction extends Model
{
    use HasFactory;

    public const UPDATED_AT = null; // pas de updated_at

    protected $fillable = [
        'reference',
        'type',
        'source_account_id',
        'target_account_id',
        'amount',
        'currency',
        'balance_before',
        'balance_after',
        'status',
        'description',
        'metadata',
        'performed_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
            'type' => TransactionType::class,
            'status' => TransactionStatus::class,
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Garde-fou : empêche toute modification après persistance.
     * Pour annuler une transaction → en créer une nouvelle de type REVERSED.
     */
    protected static function booted(): void
    {
        static::updating(function () {
            throw new \LogicException(
                'Les transactions sont immuables. Créez une transaction de type REVERSED pour annuler.'
            );
        });

        static::deleting(function () {
            throw new \LogicException('Les transactions ne peuvent pas être supprimées.');
        });
    }

    // ───── Relations ─────

    public function sourceAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'source_account_id');
    }

    public function targetAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'target_account_id');
    }

    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    // ───── Scopes ─────

    public function scopeForAccount(Builder $query, int $accountId): Builder
    {
        return $query->where(function (Builder $q) use ($accountId) {
            $q->where('source_account_id', $accountId)
                ->orWhere('target_account_id', $accountId);
        });
    }

    public function scopeOfType(Builder $query, TransactionType $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeBetween(Builder $query, ?string $from, ?string $to): Builder
    {
        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        return $query;
    }
}
