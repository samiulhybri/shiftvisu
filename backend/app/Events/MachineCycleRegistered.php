<?php

namespace App\Events;

use App\Models\Machine;
use App\Models\MachineCycle;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MachineCycleRegistered
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Machine $machine;
    public MachineCycle $machineCycle;

    /**
     * Create a new event instance.
     */
    public function __construct(Machine $machine, MachineCycle $machineCycle)
    {
        $this->machine = $machine;
        $this->machineCycle = $machineCycle;
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
