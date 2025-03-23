<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Machine;
use App\Models\MachineMachineStateTime;
use App\Models\MachineState;
use Illuminate\Console\Command;

class MachineStateTimeDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:machine_state_times';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');

        $machines = [];
        foreach (Machine::all() as $machine) {
            $machines[$machine->custom_id] = $machine->id;
        }

        $machineStates = [];
        foreach (MachineState::all() as $machineState) {
            $machineStates[$machineState->custom_id] = $machineState->id;
        }

        MachineMachineStateTime::query()->delete();

        while ($chunk = $ds->machineStateTimeDtos($skip, $take)) {
            $skip += $take;
            $toInsert = [];
            foreach ($chunk as $machineTimeDto) {
                if (!isset($machineStates[$machineTimeDto->machine_state_id_custom]) ||
                    !isset($machines[$machineTimeDto->machine_id_custom])) {
                    // sometimes an invalid machine state is set in the v10 db
                    continue;
                }
                $machineMachineStateTime = new MachineMachineStateTime();
                $machineMachineStateTime->machine_id = $machines[$machineTimeDto->machine_id_custom];
                $machineMachineStateTime->machine_state_id = $machineStates[$machineTimeDto->machine_state_id_custom];
                $machineMachineStateTime->start = $machineTimeDto->start;
                $machineMachineStateTime->end = $machineTimeDto->end;

                $toInsert[] = [
                    ...$machineMachineStateTime->toArray(),
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
            }
            MachineMachineStateTime::query()->insert($toInsert);
        }
    }
}
