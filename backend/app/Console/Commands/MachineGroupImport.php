<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Jobs\MachineGroupImport as JobMachineGroupImport;
use App\Models\CostCenter;
use App\Models\MachineGroup;
use App\Models\DataImport;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class MachineGroupImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:machinegroup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $ds = new ExternalDataSourceController();
        $machine_groups = $ds->machineGroups();
        $xmlIds = [];


        $costCenters = collect();
        foreach (CostCenter::all() as $costCenter) {
            $costCenters[$costCenter->custom_id] = $costCenter->id;
        }
        foreach ($machine_groups as $machine_group_chunks) {
            foreach ($machine_group_chunks as $machine_group) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($machine_group['xml_id']) && !in_array($machine_group['xml_id'], $xmlIds)) {
                    $xmlIds[] = $machine_group['xml_id'];
                }
                $record = MachineGroup::where('custom_id', $machine_group['custom_id'])->first();
                if (!$record) {
                    $record = new MachineGroup();
                    $record->custom_id = $machine_group['custom_id'];
                    $record->lead_time_days = 0;
                }

                FieldChecker::setField('name', $record, $machine_group, '');
                FieldChecker::setField('lead_time_days', $record, $machine_group, $record->lead_time_days);

                if (isset($machine_group['price'])) {
                    $record->machines()->each(function ($machine) use ($machine_group) {
                        $machine->price = $machine_group['price'];
                        $machine->save();
                    });
                }


                if (isset($machine_group['cost_center']) && $costCenters->has($machine_group['cost_center'])) {
                    $record->cost_center_id = $costCenters[$machine_group['cost_center']];

                    $record->machines()->each(function ($machine) use ($machine_group, $costCenters) {
                        $machine->cost_center_id = $costCenters[$machine_group['cost_center']];
                        $machine->save();
                    });
                }

                $record->save();
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            // TODO: Temporary removed until unique index on t_base_combo was created
            if (env("EXTERNAL_DS_TARGET") != 'sap') {
                if (env("EXTERNAL_DS_TARGET") == 'at') {
                    $this->dispatch(new JobMachineGroupImport('t_base_combo', 1));
                }else{
                    $this->dispatch(new JobMachineGroupImport('t_base_combo_temp', 1));
                }
            }
        }
        return 0;
    }
}
