<?php

namespace App\Events;

use App\Models\Machine;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ShopShotInserted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $request;
    public $machine;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($request)
    {
        // $machine = Machine::where('custom_id', $request->custom_id)->first();
        $this->request = [
            'custom_id' => $request->custom_id,
            'id_machine' => $request->id_machine,
            'cycle_time' => $request->cycle_time,
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // Returns the channels that the event should broadcast on.
        // 
        // In this case the event is both broadcast to the "general" channel and a channel specific to the machine.
        return [
            new Channel('general_machine_events'),
            new Channel('machine_events_' . str_replace(' ', '_', $this->request['custom_id'])),
        ];
    }

    public function broadcastWith()
    {
        // The payload that will be broadcast.
        return $this->request;
    }

    public function broadcastAs()
    {
        // The name of the event that will be broadcast.
        return 'shop_shot_event';
    }
}
