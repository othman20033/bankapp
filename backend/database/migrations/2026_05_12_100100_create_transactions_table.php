<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Table transactions = APPEND-ONLY (immuable).
 * Aucune logique applicative ne doit faire d'UPDATE ou DELETE sur cette table.
 * Pour annuler une transaction, on en crée une nouvelle de type 'reversed'.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->enum('type', ['deposit', 'withdrawal', 'transfer']);

            // Compte source (NULL pour dépôt externe)
            $table->foreignId('source_account_id')
                ->nullable()
                ->constrained('accounts')
                ->restrictOnDelete();

            // Compte cible (NULL pour retrait)
            $table->foreignId('target_account_id')
                ->nullable()
                ->constrained('accounts')
                ->restrictOnDelete();

            $table->decimal('amount', 15, 2);
            $table->char('currency', 3)->default('MAD');

            // Snapshots immuables — preuve d'audit
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);

            $table->enum('status', ['pending', 'completed', 'failed', 'reversed'])
                ->default('completed');
            $table->string('description', 255)->nullable();
            $table->json('metadata')->nullable();

            // Qui a déclenché la transaction (utile pour admin/dépôt manuel)
            $table->foreignId('performed_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->timestamp('created_at')->useCurrent();
            // ⚠️ Pas de updated_at — transactions immuables

            $table->index(['source_account_id', 'created_at']);
            $table->index(['target_account_id', 'created_at']);
            $table->index(['type', 'created_at']);
            $table->index('reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
