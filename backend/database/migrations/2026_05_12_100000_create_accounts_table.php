<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('account_number', 24)->unique();
            $table->enum('type', ['checking', 'savings'])->default('checking');

            // ⚠️ DECIMAL — JAMAIS float pour l'argent
            $table->decimal('balance', 15, 2)->default(0);

            $table->char('currency', 3)->default('MAD');
            $table->enum('status', ['active', 'blocked', 'closed'])->default('active');
            $table->timestamp('opened_at')->useCurrent();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('account_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
