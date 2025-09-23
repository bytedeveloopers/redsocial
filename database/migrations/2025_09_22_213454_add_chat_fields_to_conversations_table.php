<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->foreignId('user_one_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('user_two_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('last_message_at')->nullable();
            
            // Evitar conversaciones duplicadas
            $table->unique(['user_one_id', 'user_two_id']);
            $table->index(['user_one_id', 'user_two_id']);
            $table->index('last_message_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['user_one_id']);
            $table->dropForeign(['user_two_id']);
            $table->dropUnique(['user_one_id', 'user_two_id']);
            $table->dropIndex(['user_one_id', 'user_two_id']);
            $table->dropIndex(['last_message_at']);
            $table->dropColumn(['user_one_id', 'user_two_id', 'last_message_at']);
        });
    }
};
