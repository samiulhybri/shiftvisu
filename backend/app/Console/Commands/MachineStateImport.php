<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Jobs\BaseTableImport;
use App\Models\DataImport;
use App\Models\MachineState;
use App\Models\MachineStateGroup;
use App\Jobs\MachineStateImport as JobsMachineStateImport;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class MachineStateImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:machine_states';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run external import/basevisu v10 synchronization for machine states';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $ds = new ExternalDataSourceController();
        $machineStates = $ds->machineStates();
        $xmlIds = [];

        $machineStateGroups = collect();
        foreach (MachineStateGroup::all() as $machineStateGroup) {
            $machineStateGroups[$machineStateGroup->custom_id] = $machineStateGroup->id;
        }

        foreach ($machineStates as $machineState) {
            // we will update one xml id only one time
            // keep unique ids
            if (isset($machineState['xml_id']) && !in_array($machineState['xml_id'], $xmlIds)) {
                $xmlIds[] = $machineState['xml_id'];
            }
            $record = MachineState::where('custom_id', $machineState['custom_id'])->first();
            if (!$record) {
                if (!(isset($machineState['is_active']) && $machineState['is_active'])) {
                    //Do not create new records if they are anyways not active
                    continue;
                }
                $record = new MachineState();
                if (!$machineStateGroups->isEmpty() && (!isset($machineState['machine_state_custom_id']) || $machineState['machine_state_custom_id'] === null)) {
                    //This should just select the first groupid that is in the array
                    $record->machine_state_group_id = MachineStateGroup::pluck('id')->first();
                }
                $record->custom_id = $machineState['custom_id'];
                $record->is_active = true;
            }

            FieldChecker::setField('name', $record, $machineState, $record->name);
            FieldChecker::setField('is_active', $record, $machineState, $record->is_active);

            if (isset($machineState['machine_state_custom_id']) && $machineStateGroups->has($machineState['machine_state_custom_id'])) {
                $record->machine_state_group_id = $machineStateGroups[$machineState['machine_state_custom_id']];
            }

            $record->save();
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch((new JobsMachineStateImport('t_stillstand')));
        }
        return 0;
    }
}
