<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Notifications\MessageReceived;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    /**
     * Mostrar lista de conversaciones
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $conversations = $user->conversations()
            ->whereNotNull('last_message_at')
            ->paginate(20);

        // Cargar conteo de mensajes no leídos para cada conversación
        $conversations->getCollection()->transform(function ($conversation) use ($user) {
            $conversation->unread_count = $conversation->unreadMessagesCount($user->id);
            $conversation->other_user = $conversation->getOtherUser($user->id);
            return $conversation;
        });

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations
        ]);
    }

    /**
     * Mostrar conversación específica
     */
    public function show(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        
        // Verificar que el usuario sea parte de la conversación
        if ($conversation->user_one_id !== $user->id && $conversation->user_two_id !== $user->id) {
            abort(403);
        }

        // Cargar mensajes con paginación
        $messages = $conversation->messages()
            ->with('sender')
            ->latest()
            ->paginate(50);

        // Marcar mensajes como leídos
        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $otherUser = $conversation->getOtherUser($user->id);

        return Inertia::render('Chat/Show', [
            'conversation' => $conversation,
            'messages' => $messages,
            'otherUser' => $otherUser
        ]);
    }

    /**
     * Mostrar página para iniciar nueva conversación
     */
    public function start(Request $request)
    {
        $userId = $request->get('user');
        
        if (!$userId) {
            abort(400, 'Usuario no especificado');
        }

        $user = User::findOrFail($userId);
        $currentUser = $request->user();
        
        // No puedes chatear contigo mismo
        if ($currentUser->id === $user->id) {
            abort(400, 'No puedes chatear contigo mismo');
        }

        // Verificar si ya existe una conversación
        $existingConversation = Conversation::between($currentUser->id, $user->id);
        if ($existingConversation) {
            return redirect()->route('chat.show', $existingConversation);
        }

        return Inertia::render('Chat/Start', [
            'user' => $user
        ]);
    }

    /**
     * Crear nueva conversación y enviar primer mensaje
     */
    public function startConversation(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'message' => 'required|string|max:1000'
        ]);

        $currentUser = $request->user();
        $otherUser = User::findOrFail($request->user_id);
        
        // No puedes chatear contigo mismo
        if ($currentUser->id === $otherUser->id) {
            abort(400, 'No puedes chatear contigo mismo');
        }

        // Crear o encontrar conversación
        $conversation = Conversation::findOrCreate($currentUser->id, $otherUser->id);

        // Crear el primer mensaje
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $currentUser->id,
            'body' => $request->message
        ]);

        // Actualizar última actividad de la conversación
        $conversation->update([
            'last_message_at' => now()
        ]);

        $message->load('sender');

        // Enviar notificación al destinatario
        $otherUser->notify(new MessageReceived($message));

        // Disparar evento de broadcasting para tiempo real
        broadcast(new MessageSent($message, $otherUser));

        return response()->json([
            'success' => true,
            'conversation' => $conversation,
            'message' => $message
        ]);
    }

    /**
     * Enviar mensaje
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        
        // Verificar que el usuario sea parte de la conversación
        if ($conversation->user_one_id !== $user->id && $conversation->user_two_id !== $user->id) {
            abort(403);
        }

        $request->validate([
            'body' => 'required|string|max:1000'
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $request->body
        ]);

        // Actualizar última actividad de la conversación
        $conversation->update([
            'last_message_at' => now()
        ]);

        // Cargar el sender para la respuesta
        $message->load('sender');

        // Obtener el usuario destinatario y enviar notificación
        $recipient = $conversation->getOtherUser($user->id);
        $recipient->notify(new MessageReceived($message));

        // Disparar evento de broadcasting para tiempo real
        broadcast(new MessageSent($message, $recipient));

        return response()->json([
            'message' => $message,
            'success' => true
        ]);
    }

    /**
     * Obtener mensajes de una conversación (para actualizaciones en tiempo real)
     */
    public function getMessages(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        
        // Verificar que el usuario sea parte de la conversación
        if ($conversation->user_one_id !== $user->id && $conversation->user_two_id !== $user->id) {
            abort(403);
        }

        $lastMessageId = $request->get('last_message_id', 0);

        $messages = $conversation->messages()
            ->with('sender')
            ->where('id', '>', $lastMessageId)
            ->orderBy('created_at', 'asc')
            ->get();

        // Marcar nuevos mensajes como leídos
        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('id', '>', $lastMessageId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'messages' => $messages
        ]);
    }

    /**
     * Obtener conteo de mensajes no leídos
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        $count = Message::whereHas('conversation', function($query) use ($user) {
            $query->where('user_one_id', $user->id)
                  ->orWhere('user_two_id', $user->id);
        })
        ->where('sender_id', '!=', $user->id)
        ->whereNull('read_at')
        ->count();

        return response()->json(['count' => $count]);
    }
}
