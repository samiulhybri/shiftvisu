<?php

namespace App\Console\Commands;

use App\Events\MachineStatusChanged;
use App\Models\Machine;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Broadcast;

class SimulateMachineEvent extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'simulate:machine_event {machine}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatches a machine status changed event via event broadcasting.';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $machineId = $this->argument('machine');
        $machine = Machine::find($machineId);

        $this->info("Simulating machine event for machine \"{$machine->name}\".");

        MachineStatusChanged::dispatch($machine);

        return Command::SUCCESS;
    }
}
