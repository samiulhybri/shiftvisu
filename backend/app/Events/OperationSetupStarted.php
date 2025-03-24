<?php

namespace App\Events;

use App\Models\Machine;
use App\Models\ProdOrderPosOperation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OperationSetupStarted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Machine $machine;
    public ProdOrderPosOperation $operation;

    /**
     * Create a new event instance.
     */
    public function __construct(Machine $machine, ProdOrderPosOperation $operation)
    {
        $this->machine = $machine;
        $this->operation = $operation;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
