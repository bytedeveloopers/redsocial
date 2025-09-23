<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // autor del post
            $table->text('body');                                           // texto del post
            $table->string('image_path')->nullable();                       // ruta de imagen (opcional)
            $table->timestamps();

            $table->index(['user_id','created_at']);                        // para feed por usuario/fecha
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
