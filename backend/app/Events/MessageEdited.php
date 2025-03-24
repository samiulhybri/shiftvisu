<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;


class MessageEdited implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        $users = $this->message->chat->users->pluck('id');

        return $users->map(function ($user) {
            return new PresenceChannel('user.' . $user);
        })->toArray();
    }

    public function broadcastAs()
    {
        return 'message_edited';
    }

    public function broadcastWith()
    {
        return [
            'chat_id' => $this->message->chat_id,
            'message' => $this->message,
        ];
    }
}
