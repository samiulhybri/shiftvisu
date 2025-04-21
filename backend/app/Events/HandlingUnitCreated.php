<?php

namespace App\Events;

use App\Models\HandlingUnit;
use App\Models\Machine;
use App\Models\ProdOrderPosOperation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HandlingUnitCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Machine $machine;
    public ?ProdOrderPosOperation $operation;
    public ?HandlingUnit $handlingUnit;

    /**
     * Create a new event instance.
     */
    public function __construct(Machine $machine, HandlingUnit $handlingUnit, ?ProdOrderPosOperation $operation = null)
    {
        $this->machine = $machine;
        $this->handlingUnit = $handlingUnit;
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
