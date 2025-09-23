<?php

use Illuminate\Support\Facades\Broadcast;

// Canal de usuario general
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal de notificaciones por usuario
Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Canal de chat por usuario
Broadcast::channel('chat.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Canal de conversación específica
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    // Verificar que el usuario sea parte de la conversación
    $conversation = \App\Models\Conversation::find($conversationId);
    return $conversation && (
        $conversation->user_one_id === $user->id || 
        $conversation->user_two_id === $user->id
    );
});
