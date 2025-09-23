<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'bio',
        'avatar_path',
        'location',
        'website',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Un usuario tiene muchos posts.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(\App\Models\Post::class);
    }

    /**
     * Usuarios que este usuario sigue
     */
    public function following(): HasMany
    {
        return $this->hasMany(Follow::class, 'user_id');
    }

    /**
     * Usuarios que siguen a este usuario
     */
    public function followers(): HasMany
    {
        return $this->hasMany(Follow::class, 'followed_user_id');
    }

    /**
     * Verificar si este usuario sigue a otro usuario
     */
    public function isFollowing(User $user): bool
    {
        return $this->following()->where('followed_user_id', $user->id)->exists();
    }

    /**
     * Contar cuántos usuarios sigue
     */
    public function followingCount(): int
    {
        return $this->following()->count();
    }

    /**
     * Contar cuántos seguidores tiene
     */
    public function followersCount(): int
    {
        return $this->followers()->count();
    }

    /**
     * Conversaciones donde el usuario es participant one
     */
    public function conversationsAsUserOne(): HasMany
    {
        return $this->hasMany(Conversation::class, 'user_one_id');
    }

    /**
     * Conversaciones donde el usuario es participant two
     */
    public function conversationsAsUserTwo(): HasMany
    {
        return $this->hasMany(Conversation::class, 'user_two_id');
    }

    /**
     * Todas las conversaciones del usuario
     */
    public function conversations()
    {
        return Conversation::where('user_one_id', $this->id)
            ->orWhere('user_two_id', $this->id)
            ->with(['userOne', 'userTwo', 'lastMessage.sender'])
            ->orderBy('last_message_at', 'desc');
    }

    /**
     * Mensajes enviados por el usuario
     */
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }
}
