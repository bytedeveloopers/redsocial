<?php

namespace App\Events;

use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $recipient;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message, User $recipient)
    {
        $this->message = $message->load('sender');
        $this->recipient = $recipient;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->recipient->id),
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
            'conversation_id' => $this->message->conversation_id,
            'unread_chat_count' => $this->getUnreadChatCount(),
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Get unread chat count for recipient
     */
    private function getUnreadChatCount(): int
    {
        return \App\Models\Message::whereHas('conversation', function($query) {
            $query->where('user_one_id', $this->recipient->id)
                  ->orWhere('user_two_id', $this->recipient->id);
        })
        ->where('sender_id', '!=', $this->recipient->id)
        ->whereNull('read_at')
        ->count();
    }
}
