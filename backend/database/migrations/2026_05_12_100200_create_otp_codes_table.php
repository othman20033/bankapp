<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Hash bcrypt du code à 6 chiffres — jamais en clair en BDD
            $table->string('code_hash');

            $table->enum('purpose', [
                'login', 'transfer', 'withdrawal', 'reset_password', 'email_verification',
            ]);

            // Canal d'envoi pour audit
            $table->enum('channel', ['email', 'sms'])->default('email');

            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->json('metadata')->nullable(); // ip, device, contexte transaction
            $table->timestamps();

            $table->index(['user_id', 'purpose', 'used_at']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otp_codes');
    }
};
