<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Follow extends Model
{
    protected $fillable = ['user_id', 'followed_user_id'];

    /**
     * Usuario que sigue
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Usuario que es seguido
     */
    public function followedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'followed_user_id');
    }
}
