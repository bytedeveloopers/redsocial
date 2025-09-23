<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'user_one_id',
        'user_two_id',
        'last_message_at'
    ];

    protected $casts = [
        'last_message_at' => 'datetime'
    ];

    /**
     * Usuario uno de la conversación
     */
    public function userOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    /**
     * Usuario dos de la conversación
     */
    public function userTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    /**
     * Mensajes de la conversación
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    /**
     * Último mensaje de la conversación
     */
    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latest();
    }

    /**
     * Obtener el otro usuario de la conversación
     */
    public function getOtherUser($userId)
    {
        return $this->user_one_id === $userId ? $this->userTwo : $this->userOne;
    }

    /**
     * Obtener conversación entre dos usuarios
     */
    public static function between($userOneId, $userTwoId)
    {
        return static::where(function($query) use ($userOneId, $userTwoId) {
            $query->where('user_one_id', $userOneId)
                  ->where('user_two_id', $userTwoId);
        })->orWhere(function($query) use ($userOneId, $userTwoId) {
            $query->where('user_one_id', $userTwoId)
                  ->where('user_two_id', $userOneId);
        })->first();
    }

    /**
     * Crear o encontrar conversación entre dos usuarios
     */
    public static function findOrCreate($userOneId, $userTwoId)
    {
        $conversation = static::between($userOneId, $userTwoId);
        
        if (!$conversation) {
            // Asegurar que user_one_id sea siempre el menor ID
            $minId = min($userOneId, $userTwoId);
            $maxId = max($userOneId, $userTwoId);
            
            $conversation = static::create([
                'user_one_id' => $minId,
                'user_two_id' => $maxId
            ]);
        }
        
        return $conversation;
    }

    /**
     * Contar mensajes no leídos para un usuario
     */
    public function unreadMessagesCount($userId)
    {
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->count();
    }
}
