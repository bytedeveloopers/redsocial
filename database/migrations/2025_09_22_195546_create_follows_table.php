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
        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Quien sigue
            $table->foreignId('followed_user_id')->constrained('users')->onDelete('cascade'); // A quien sigue
            $table->timestamps();
            
            // Evitar seguir al mismo usuario dos veces
            $table->unique(['user_id', 'followed_user_id']);
            
            // Índices para optimizar consultas
            $table->index('user_id');
            $table->index('followed_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};
