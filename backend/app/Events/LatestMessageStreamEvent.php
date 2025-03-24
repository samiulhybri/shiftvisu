<?php

namespace App\Events;

use App\Models\Chat;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LatestMessageStreamEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(public Chat $chat, public string $content)
    {
        //
    }

    public function broadcastAs()
    {
        return 'latest_message_stream';
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

    public function broadcastWith()
    {
        return [
            'chat_id' => $this->chat->id,
            'content' => $this->content,
        ];
    }
}
