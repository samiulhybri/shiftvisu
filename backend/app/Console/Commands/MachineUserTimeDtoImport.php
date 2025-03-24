<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Machine;
use App\Models\MachineUserTime;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Console\Command;

class MachineUserTimeDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:machine_user_times';

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

        $users = [];
        foreach (User::all() as $user) {
            $users[$user->custom_id] = $user->id;
        }

        $shifts = [];
        foreach (Shift::all() as $shift) {
            $shifts[$shift->custom_id] = $shift->id;
        }

        MachineUserTime::query()->delete();

        while ($chunk = $ds->machineUserTimeDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $machineTimeDto) {
                if (!isset($machines[$machineTimeDto->machine_id_custom]) ||
                    !isset($users[$machineTimeDto->user_id_custom])) {
                    continue;
                }

                $machineUserTime = new MachineUserTime();
                $machineUserTime->machine_id = $machines[$machineTimeDto->machine_id_custom];
                $machineUserTime->user_id = $users[$machineTimeDto->user_id_custom];
                $machineUserTime->start = $machineTimeDto->start;
                $machineUserTime->end = $machineTimeDto->end;
                $machineUserTime->shift_id = $shifts[$machineTimeDto->shift_id_custom] ?? null;
                $machineUserTime->save();
            }
        }
    }
}
