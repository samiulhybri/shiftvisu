<?php

namespace App\Events;

use App\Models\Machine;
use App\Models\MachineMachineStateTime;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MachineStateChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Machine $machine;
    public MachineMachineStateTime $machineStateTime;

    /**
     * Create a new event instance.
     */
    public function __construct(Machine $machine, MachineMachineStateTime $machineStateTime)
    {
        $this->machine = $machine;
        $this->machineStateTime = $machineStateTime;
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
