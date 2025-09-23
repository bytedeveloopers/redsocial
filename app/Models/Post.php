<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'body', 'image_path'];

    // Autor del post
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Likes del post
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    // Comentarios del post
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
