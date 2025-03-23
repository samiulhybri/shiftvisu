<?php

namespace App\Events;

use App\Models\Message;
use App\Models\Chat;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public int $messageId;
    public Chat $chat;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Message $message)
    {
        $this->messageId = $message->id;
        $this->chat = $message->chat;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {

        $users = $this->chat->users->pluck('id');

        return $users->map(function ($user) {
            return new PresenceChannel('user.' . $user);
        })->toArray();
    }

    public function broadcastAs()
    {
        return 'message_deleted';
    }

    public function broadcastWith()
    {
        return ['message_id' => $this->messageId];
    }
}
