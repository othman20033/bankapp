<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditService
{
    public function __construct(private readonly Request $request) {}

    /**
     * Enregistre une action dans le journal d'audit.
     *
     * @param  string  $action  ex: "transaction.transfer.completed"
     * @param  Model|null  $auditable  objet concerné (polymorphique)
     * @param  array|null  $oldValues  snapshot avant
     * @param  array|null  $newValues  snapshot après
     */
    public function log(
        string $action,
        ?Model $auditable = null,
        ?array $oldValues = null,
        ?array $newValues = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'auditable_type' => $auditable ? $auditable::class : null,
            'auditable_id' => $auditable?->getKey(),
            'ip_address' => $this->request->ip(),
            'user_agent' => substr((string) $this->request->userAgent(), 0, 500),
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }
}
